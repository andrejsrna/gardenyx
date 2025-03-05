import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Builder, Parser } from 'xml2js';
import { logError } from '../../../lib/utils/logger';

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

interface WooCommerceError extends Error {
  response?: {
    data: {
      message?: string;
      [key: string]: unknown;
    };
    status?: number;
  };
}

interface MetaData {
  key: string;
  value: string;
}

interface OrderData {
  shipping_method: string;
  payment_method: string;
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
    postcode: string;
  };
  billing: {
    email: string;
    phone: string;
  };
  meta_data?: MetaData[];
  line_items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

// Nové rozhranie pre idempotentnosť
interface OrderRequestWithIdempotencyKey extends OrderData {
  idempotency_key?: string;
  meta_data?: MetaData[];
}

// Pridám rozhranie pre WooCommerce objednávku
interface WooCommerceOrder {
  id: number;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
  // Ďalšie polia, ktoré môžu byť potrebné
}

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
const PACKETA_CARRIER_ID = '131'; // ID pre Slovensko home delivery

// Initialize the WooCommerce API with your credentials
const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

// Pomocná funkcia na generovanie hash-u pre idempotentnosť
function generateOrderHash(orderData: OrderData): string {
  // Vytvorenie konzistentného reťazca z kľúčových údajov objednávky
  const orderSignature = JSON.stringify({
    billing_email: orderData.billing.email,
    billing_phone: orderData.billing.phone,
    line_items: orderData.line_items,
    shipping_method: orderData.shipping_method,
    payment_method: orderData.payment_method,
    timestamp: new Date().toISOString().slice(0, 16) // Presnosť na minúty - 5-minútové okno na odoslanie
  });

  // Vytvorenie hash-u
  return createHash('sha256').update(orderSignature).digest('hex');
}

// Funkcia na kontrolu existujúcej objednávky podľa idempotency_key
async function findExistingOrder(idempotencyKey: string) {
  try {
    // Hľadáme objednávku s daným idempotency_key v meta_data
    const response = await api.get('orders', {
      per_page: 5, // Optimalizácia - kontrolujeme len niekoľko najnovších objednávok
      orderby: 'date',
      order: 'desc',
      status: ['pending', 'processing', 'completed']
    });

    if (response.data && response.data.length > 0) {
      // Hľadáme objednávku s rovnakým idempotency_key
      const existingOrder = response.data.find((order: WooCommerceOrder) =>
        order.meta_data?.some((meta: { key: string; value: string }) =>
          meta.key === '_idempotency_key' && meta.value === idempotencyKey
        )
      );

      return existingOrder || null;
    }

    return null;
  } catch (error) {
    console.error('Error finding existing order:', error);
    return null;
  }
}

async function createPacketaPacket(orderData: OrderData, orderId: number, total: number) {
  try {
    const isHomeDelivery = orderData.shipping_method === 'packeta_home';

    // Base packet attributes
    const packetAttributes = {
      number: orderId.toString(),
      name: orderData.shipping.first_name,
      surname: orderData.shipping.last_name,
      email: orderData.billing.email,
      phone: orderData.billing.phone,
      value: total.toString(),
      currency: 'EUR',
      weight: calculateTotalWeight(orderData.line_items).toString(),
      eshop: 'FITDOPLNKY',
      cod: orderData.payment_method === 'cod' ? total.toString() : undefined
    };

    // Add delivery specific attributes
    if (isHomeDelivery) {
      // Pre home delivery potrebujeme carrier ID a kompletnú adresu
      const address = orderData.shipping.address_1.split(' ');
      const houseNumber = address.pop() || '';
      const street = address.join(' ');

      Object.assign(packetAttributes, {
        addressId: PACKETA_CARRIER_ID,
        street,
        houseNumber,
        city: orderData.shipping.city,
        zip: orderData.shipping.postcode.replace(/\s/g, '')
      });
    } else {
      // Pre pickup point potrebujeme len ID výdajného miesta
      const pointId = orderData.meta_data?.find((m: MetaData) => m.key === '_packeta_point_id')?.value;
      if (!pointId) {
        throw new Error('Missing Packeta point ID for pickup delivery');
      }
      Object.assign(packetAttributes, {
        addressId: pointId
      });
    }

    // Prepare XML request
    const xmlData = {
      createPacket: {
        apiPassword: PACKETA_API_PASSWORD,
        packetAttributes
      }
    };

    // Convert to XML with proper formatting
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create Packeta packet: ${response.statusText}. Response: ${errorText}`);
    }

    const responseText = await response.text();
    const parser = new Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(responseText) as PacketaResponse;

    if (result.response?.status !== 'ok') {
      throw new Error(result.response?.message || 'Failed to create Packeta packet');
    }

    if (!result.response.result) {
      throw new Error('Missing result data in Packeta response');
    }

    // Update order with Packeta tracking data
    await api.put(`orders/${orderId}`, {
      meta_data: [
        { key: '_packeta_packet_id', value: result.response.result.id },
        { key: '_packeta_barcode', value: result.response.result.barcode },
        { key: '_packeta_barcode_text', value: result.response.result.barcodeText }
      ]
    });

    return result.response.result;

  } catch (error) {
    logError('Packeta Packet Creation', {
      error,
      orderId: orderId.toString(),
      customerEmail: orderData.billing.email,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

function calculateTotalWeight(lineItems: Array<{ product_id: number; quantity: number }>): number {
  // TODO: Implement actual weight calculation based on products
  // For now, using a default weight per item
  return lineItems.reduce((total, item) => total + (item.quantity * 0.5), 0);
}

export async function POST(request: Request) {
  try {
    // Získame dáta objednávky
    const orderData: OrderRequestWithIdempotencyKey = await request.json();

    // Získame alebo vygenerujeme idempotency key
    const idempotencyKey = orderData.idempotency_key || generateOrderHash(orderData);

    // Skontrolujeme, či už existuje objednávka s týmto idempotency key
    const existingOrder = await findExistingOrder(idempotencyKey);

    if (existingOrder) {
      console.log(`Found existing order #${existingOrder.id} with idempotency key ${idempotencyKey}`);

      // Ak áno, vrátime existujúcu objednávku namiesto vytvorenia novej
      return NextResponse.json({
        order: existingOrder,
        isExisting: true
      });
    }

    // Pridáme idempotency key do meta_data objednávky
    if (!orderData.meta_data) {
      orderData.meta_data = [];
    }

    orderData.meta_data.push({
      key: '_idempotency_key',
      value: idempotencyKey
    });

    // Pridáme session identifier pre ďalšiu ochranu
    // Oprava cookies() funkcie, ktorá vracia Promise
    const cookiesStore = await cookies();
    const sessionId = cookiesStore.get('next-auth.session-token')?.value ||
                      cookiesStore.get('__Secure-next-auth.session-token')?.value ||
                      request.headers.get('x-session-id');

    if (sessionId) {
      orderData.meta_data.push({
        key: '_session_id',
        value: sessionId
      });
    }

    // Vytvoríme novú objednávku
    const response = await api.post('orders', orderData);

    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from WooCommerce');
    }

    // Vytvorenie Packeta packetu...
    if (orderData.shipping_method === 'packeta_pickup' || orderData.shipping_method === 'packeta_home') {
      try {
        await createPacketaPacket(orderData, response.data.id, Number(response.data.total));
      } catch (error) {
        // Log error but don't fail the order creation
        console.error('Failed to create Packeta packet:', error);
      }
    }

    // Log úspešného vytvorenia objednávky
    console.log(`Created new order #${response.data.id} with idempotency key ${idempotencyKey}`);

    return NextResponse.json({
      order: response.data,
      isExisting: false
    });

  } catch (error: unknown) {
    console.error('Order creation error:', error);

    const err = error as WooCommerceError;

    if (err.response?.data) {
      return NextResponse.json(
        {
          error: {
            message: err.response.data.message || 'WooCommerce API error',
            details: err.response.data
          }
        },
        { status: err.response.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: {
          message: (err as Error).message || 'Internal server error',
          details: process.env.NODE_ENV === 'development' ? err : undefined
        }
      },
      { status: 500 }
    );
  }
}
