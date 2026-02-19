import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import { Builder, Parser } from 'xml2js';
import prisma from '@/app/lib/prisma';
import { logError } from '@/app/lib/utils/logger';
import { isSalesSuspended, getSalesSuspensionMessage } from '@/app/lib/utils/sales-suspension';
import { Prisma, OrderStatus, PaymentMethod as PaymentMethodEnum, PaymentStatus as PaymentStatusEnum } from '@prisma/client';
import { sendOrderConfirmationEmail, sendOrderNotificationToAdmin } from '@/app/lib/email/order-confirmation';
import { recordCouponRedemption } from '@/app/lib/coupons';
import { getIronSession } from 'iron-session';
import { sessionConfig } from '@/app/lib/config/session';
import type { SessionData } from '@/app/lib/config/session';

interface PacketaResponse {
  response: {
    status: string;
    result?: {
      id: string;
      barcode: string;
      barcodeText: string;
    };
    message?: string;
  };
}

interface MetaData {
  key: string;
  value: string;
}

interface OrderLineItemInput {
  product_id: number;
  quantity: number;
  price?: number;
  total?: number;
  name?: string;
  sku?: string;
  variation_id?: number;
  image?: string;
  meta?: unknown;
}

interface OrderData {
  shipping_method: string;
  payment_method: string;
  status?: string;
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    company?: string;
    address_2?: string;
    state?: string;
    country?: string;
  };
  billing: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
    country?: string;
    company?: string;
    address_2?: string;
    state?: string;
    email: string;
    phone: string;
    ic?: string;
    dic?: string;
    dic_dph?: string;
  };
  meta_data?: MetaData[];
  line_items: OrderLineItemInput[];
  shipping_lines?: Array<{
    method_id: string;
    method_title: string;
    total: string;
    total_tax?: string;
  }>;
  total?: string; // optional total for COD
  customer_note?: string;
  idempotency_key?: string;
}

type OrderWithRelations = Prisma.OrderGetPayload<{ include: { items: true; addresses: true; meta: true } }>;

const logBrevoFailure = (tag: string, err: unknown) => {
  const maybeAxiosError = err as {
    response?: { status?: number; data?: unknown };
    message?: string;
  };
  console.warn(tag, {
    message: maybeAxiosError?.message,
    status: maybeAxiosError?.response?.status,
    data: maybeAxiosError?.response?.data
  });
};

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
const PACKETA_CARRIER_ID = '131';
const VAT_RATE = 0.19;

function normalizePacketaHomeAddress(shipping: OrderData['shipping']) {
  const address1 = (shipping.address_1 || '').trim();
  const address2 = (shipping.address_2 || '').trim();
  const postcode = (shipping.postcode || '').trim();
  if (!address1 || !address2) return shipping;

  const digitsOnly = /^[\d\s]+$/.test(address1);
  const sameAsPostcode = postcode && address1.replace(/\s/g, '') === postcode.replace(/\s/g, '');
  const address2HasLetters = /[A-Za-zÀ-ž]/.test(address2);

  if ((digitsOnly || sameAsPostcode) && address2HasLetters) {
    return { ...shipping, address_1: address2, address_2: '' };
  }

  return shipping;
}

function generateOrderHash(orderData: OrderData): string {
  const orderSignature = JSON.stringify({
    billing_email: orderData.billing.email,
    billing_phone: orderData.billing.phone,
    line_items: orderData.line_items,
    shipping_method: orderData.shipping_method,
    payment_method: orderData.payment_method
  });
  return createHash('sha256').update(orderSignature).digest('hex');
}

async function findExistingOrder(idempotencyKey: string) {
  return prisma.order.findFirst({
    where: {
      meta: {
        some: { key: '_idempotency_key', value: idempotencyKey }
      }
    },
    include: {
      items: true,
      addresses: true,
      meta: true
    }
  });
}

function parseAddress(addressLine: string): { street: string; houseNumber: string } {
  if (!addressLine) {
    return { street: '', houseNumber: '' };
  }
  const match = addressLine.match(/^(.*?)\s*([\d/A-Za-z-]+)$/);
  if (match && match[2] && /\d/.test(match[2])) {
    const street = (match[1] || '').trim();
    const houseNumber = match[2].trim();
    return { street, houseNumber };
  }
  return { street: addressLine.trim(), houseNumber: '' };
}

function calculateTotalWeight(lineItems: Array<{ quantity: number }>): number {
  return lineItems.reduce((total, item) => total + (item.quantity * 0.5), 0);
}

async function createPacketaPacket(orderData: OrderData, order: OrderWithRelations) {
  if (!PACKETA_API_PASSWORD) {
    throw new Error('Missing Packeta API Password');
  }
  const isHomeDelivery = orderData.shipping_method === 'packeta_home';

  const packetAttributes: Record<string, string | undefined> = {
    number: order.orderNumber.toString(),
    name: orderData.shipping.first_name,
    surname: orderData.shipping.last_name,
    email: orderData.billing.email,
    phone: orderData.billing.phone.replace(/[^\d]/g, ''),
    value: order.total.toString(),
    currency: order.currency,
    weight: calculateTotalWeight(orderData.line_items).toString(),
    eshop: 'FITDOPLNKY',
    cod: orderData.payment_method === 'cod' ? order.total.toString() : undefined
  };

  if (isHomeDelivery) {
    let addressLine = orderData.shipping.address_1;
    let parsed = parseAddress(addressLine);
    if (!parsed.street && orderData.shipping.address_2) {
      addressLine = orderData.shipping.address_2;
      parsed = parseAddress(addressLine);
    }
    const { street, houseNumber } = parsed;
    if (!street) {
      throw new Error(`Invalid address format for home delivery (missing street): ${addressLine}`);
    }
    if (!houseNumber) {
      logError('Packeta Address Warning', {
        error: {
          message: `Address '${addressLine}' parsed without house number. Sending empty houseNumber.`,
          parsedStreet: street,
          parsedHouseNumber: houseNumber,
        },
        orderId: order.id,
        timestamp: new Date().toISOString()
      });
    }
    Object.assign(packetAttributes, {
      addressId: PACKETA_CARRIER_ID,
      street,
      houseNumber,
      city: orderData.shipping.city,
      zip: orderData.shipping.postcode.replace(/\s/g, '')
    });
  } else {
    const pointId = orderData.meta_data?.find(m => m.key === '_packeta_point_id')?.value;
    if (!pointId) {
      throw new Error('Missing Packeta point ID for pickup delivery');
    }
    Object.assign(packetAttributes, {
      addressId: pointId
    });
  }

  const xmlData = {
    createPacket: {
      apiPassword: PACKETA_API_PASSWORD,
      packetAttributes
    }
  };

  const builder = new Builder({
    renderOpts: { pretty: true, indent: '  ' },
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });
  const xmlRequest = builder.buildObject(xmlData);

  const response = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    },
    body: xmlRequest
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to create Packeta packet: ${response.statusText}. Response: ${responseText}`);
  }

  const parser = new Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(responseText) as PacketaResponse;

  if (result.response?.status !== 'ok') {
    throw new Error(result.response?.message || `Failed to create Packeta packet: ${result.response?.status}`);
  }
  if (!result.response.result) {
    throw new Error('Missing result data in Packeta response');
  }

  await prisma.orderMeta.createMany({
    data: [
      { orderId: order.id, key: '_packeta_packet_id', value: result.response.result.id },
      { orderId: order.id, key: '_packeta_barcode', value: result.response.result.barcode },
      { orderId: order.id, key: '_packeta_barcode_text', value: result.response.result.barcodeText }
    ]
  });

  return result.response.result;
}

function toDecimal(value: number | string | undefined, fallback = 0) {
  const num = typeof value === 'string' ? Number(value) : value;
  const safe = Number.isFinite(num) ? Number(num) : fallback;
  return new Prisma.Decimal(safe.toFixed(2));
}

function calculateVatFromGross(grossValue: number) {
  if (!Number.isFinite(grossValue) || grossValue <= 0) return 0;
  return grossValue * (VAT_RATE / (1 + VAT_RATE));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const email = searchParams.get('email');
  const sessionIdFilter = searchParams.get('sessionId');
  const paymentIntentId = searchParams.get('payment_intent') || searchParams.get('transactionId');

  try {
    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true, addresses: true, meta: true }
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (paymentIntentId) {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { transactionId: paymentIntentId },
            {
              meta: {
                some: {
                  key: '_stripe_payment_intent_id',
                  value: paymentIntentId
                }
              }
            }
          ]
        },
        include: { items: true, addresses: true, meta: true }
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    const where: Prisma.OrderWhereInput = {};
    if (email) {
      where.addresses = {
        some: {
          type: 'BILLING',
          email: email.toLowerCase()
        }
      };
    }
    if (sessionIdFilter) {
      where.meta = {
        some: {
          key: '_session_id',
          value: sessionIdFilter
        }
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: { items: true, addresses: true, meta: true }
      }),
      prisma.order.count({ where })
    ]);

    return NextResponse.json({ orders, total, page, limit });
  } catch (error) {
    logError('Order fetch failed', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (isSalesSuspended()) {
      return NextResponse.json(
        { message: getSalesSuspensionMessage() },
        { status: 503 }
      );
    }

    const orderData: OrderData = await request.json();
    orderData.line_items = orderData.line_items || [];
    if (orderData.shipping_method === 'packeta_home') {
      orderData.shipping = normalizePacketaHomeAddress(orderData.shipping);
    }
    const idempotencyKey = orderData.idempotency_key || generateOrderHash(orderData);
    const existingOrder = await findExistingOrder(idempotencyKey);
    if (existingOrder) {
      return NextResponse.json({
        order: existingOrder,
        isExisting: true
      });
    }

    if (!orderData.meta_data) {
      orderData.meta_data = [];
    }
    if (!orderData.meta_data.some(m => m.key === '_idempotency_key')) {
      orderData.meta_data.push({ key: '_idempotency_key', value: idempotencyKey });
    }

    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get('next-auth.session-token')?.value ||
      cookiesStore.get('__Secure-next-auth.session-token')?.value ||
      request.headers.get('x-session-id') || undefined;

    const desiredStatus = orderData.payment_method === 'cod'
      ? 'processing'
      : (orderData.status || 'pending');

    const shippingTotal = orderData.shipping_lines?.reduce((sum, line) => {
      const net = Number(line.total) || 0;
      const tax = Number(line.total_tax) || 0;
      return sum + net + tax;
    }, 0) || 0;
    const shippingTaxTotal = orderData.shipping_lines?.reduce((sum, line) => {
      const explicitTax = Number(line.total_tax);
      if (Number.isFinite(explicitTax)) {
        return sum + explicitTax;
      }
      const net = Number(line.total);
      return Number.isFinite(net) ? sum + net * VAT_RATE : sum;
    }, 0) || 0;

    const metaPacketa = {
      id: orderData.meta_data.find(m => m.key === '_packeta_point_id')?.value || null,
      name: orderData.meta_data.find(m => m.key === '_packeta_point_name')?.value || null,
      city: orderData.meta_data.find(m => m.key === '_packeta_point_city')?.value || null,
      street: orderData.meta_data.find(m => m.key === '_packeta_point_street')?.value || null,
      zip: orderData.meta_data.find(m => m.key === '_packeta_point_zip')?.value || null
    };

    const subtotal = orderData.line_items.reduce((sum, li) => {
      const price = Number(li.price);
      const quantity = Number(li.quantity) || 0;
      if (Number.isFinite(price)) {
        return sum + price * quantity;
      }
      return sum;
    }, 0);

    const discountMeta = orderData.meta_data.find(m => m.key === '_discount_total')?.value;
    const discountTotal = Number(discountMeta) || 0;
    const couponCode = orderData.meta_data.find(m => m.key === '_coupon_code')?.value;

    const itemsGross = Math.max(0, subtotal - discountTotal);
    const itemsTaxTotal = calculateVatFromGross(itemsGross);
    const taxTotal = itemsTaxTotal + shippingTaxTotal;
    const total = orderData.total ? Number(orderData.total) : Math.max(0, itemsGross + shippingTotal);

    // link to user if session or email matches
    let userId: string | undefined;
    const session = await getIronSession<SessionData>(request, new NextResponse(), sessionConfig);
    if (session?.customerId) {
      userId = session.customerId;
    } else if (orderData.billing?.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: orderData.billing.email.toLowerCase() } });
      if (existingUser) {
        userId = existingUser.id;
      }
    }
    const billingEmail = orderData.billing?.email?.toLowerCase() || '';

    const createdOrder = await prisma.order.create({
      data: {
        userId,
        status: desiredStatus as OrderStatus,
        paymentStatus: desiredStatus === 'processing' ? PaymentStatusEnum.paid : PaymentStatusEnum.pending,
        paymentMethod: orderData.payment_method as PaymentMethodEnum,
        transactionId: undefined,
        currency: 'EUR',
        subtotal: toDecimal(subtotal),
        shippingTotal: toDecimal(shippingTotal),
        taxTotal: toDecimal(taxTotal),
        discountTotal: toDecimal(discountTotal),
        total: toDecimal(total),
        shippingMethod: orderData.shipping_method,
        customerNote: orderData.customer_note,
        marketingConsent: orderData.meta_data.some(m => m.key === '_marketing_consent'),
        sessionId,
        packetaPointId: metaPacketa.id,
        packetaPointName: metaPacketa.name,
        packetaPointCity: metaPacketa.city,
        packetaPointStreet: metaPacketa.street,
        packetaPointZip: metaPacketa.zip,
        meta: {
          create: orderData.meta_data.map(m => ({
            key: m.key,
            value: m.value
          }))
        },
        items: {
          create: orderData.line_items.map(li => {
            const price = Number(li.price);
            const totalLine = Number(li.total);
            const safePrice = Number.isFinite(price) ? price : 0;
            const safeTotal = Number.isFinite(totalLine) ? totalLine : safePrice * li.quantity;
            return {
              productId: li.product_id,
              productName: li.name || `Product ${li.product_id}`,
              sku: li.sku,
              variationId: li.variation_id,
              imageUrl: li.image,
              price: toDecimal(safePrice),
              quantity: li.quantity,
              total: toDecimal(safeTotal),
              ...(li.meta ? { meta: li.meta as Prisma.InputJsonValue } : {})
            };
          })
        },
        addresses: {
          create: [
            {
              type: 'BILLING',
              firstName: orderData.billing.first_name,
              lastName: orderData.billing.last_name,
              company: orderData.billing.company,
              address1: orderData.billing.address_1,
              address2: orderData.billing.address_2,
              city: orderData.billing.city,
              state: orderData.billing.state,
              postcode: orderData.billing.postcode,
              country: orderData.billing.country || 'SK',
              phone: orderData.billing.phone,
              email: billingEmail || orderData.billing.email,
              ic: orderData.billing.ic,
              dic: orderData.billing.dic,
              dicDph: orderData.billing.dic_dph
            },
            {
              type: 'SHIPPING',
              firstName: orderData.shipping.first_name,
              lastName: orderData.shipping.last_name,
              company: orderData.shipping.company,
              address1: orderData.shipping.address_1,
              address2: orderData.shipping.address_2,
              city: orderData.shipping.city,
              state: orderData.shipping.state,
              postcode: orderData.shipping.postcode,
              country: orderData.shipping.country || 'SK',
              phone: orderData.billing.phone,
              email: billingEmail || orderData.billing.email
            }
          ]
        }
      },
      include: { items: true, addresses: true, meta: true }
    });

    if (couponCode) {
      recordCouponRedemption({ couponCode, orderId: createdOrder.id, email: billingEmail })
        .catch(err => console.warn('[coupon redemption cod] failed', err));
    }

    if (
      (orderData.shipping_method === 'packeta_pickup' || orderData.shipping_method === 'packeta_home') &&
      desiredStatus === 'processing'
    ) {
      try {
        await createPacketaPacket(orderData, createdOrder as unknown as OrderWithRelations);
      } catch (packetaError) {
        const packetaErrorMessage = packetaError instanceof Error ? packetaError.message : String(packetaError);
        const ts = new Date().toISOString();

        // IMPORTANT: keep order in processing; store Packeta failure in meta for admin retry.
        try {
          await prisma.orderMeta.deleteMany({
            where: {
              orderId: createdOrder.id,
              key: { in: ['_packeta_error', '_packeta_error_at'] }
            }
          });
          await prisma.orderMeta.createMany({
            data: [
              { orderId: createdOrder.id, key: '_packeta_error', value: packetaErrorMessage },
              { orderId: createdOrder.id, key: '_packeta_error_at', value: ts }
            ]
          });
        } catch {
          // ignore secondary failure
        }

        logError('Packeta Packet Creation Failed', {
          error: packetaErrorMessage,
          orderId: createdOrder.id,
          customerEmail: orderData.billing.email,
          timestamp: ts
        });
      }
    }

    const fullOrder = await prisma.order.findUnique({
      where: { id: createdOrder.id },
      include: { items: true, addresses: true, meta: true }
    }) as unknown as OrderWithRelations | null;

    if (orderData.billing?.email && fullOrder) {
      sendOrderConfirmationEmail(fullOrder, orderData.billing.email)
        .catch(err => logBrevoFailure('[order confirmation email] failed', err));
      sendOrderNotificationToAdmin(fullOrder, orderData.billing.email)
        .catch(err => logBrevoFailure('[order admin email] failed', err));
    } else if (fullOrder) {
      sendOrderNotificationToAdmin(fullOrder)
        .catch(err => logBrevoFailure('[order admin email] failed', err));
    }

    return NextResponse.json({
      order: fullOrder || createdOrder,
      isExisting: false
    });
  } catch (error) {
    logError('Internal Server Error (Order Creation)', {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      },
      { status: 500 }
    );
  }
}
