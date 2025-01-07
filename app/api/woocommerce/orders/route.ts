import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { logError } from '../../../lib/utils/logger';
import { Builder, Parser } from 'xml2js';

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
    const orderData: OrderData = await request.json();
    const response = await api.post('orders', orderData);

    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from WooCommerce');
    }

    // Create Packeta packet if shipping method is Packeta
    if (orderData.shipping_method === 'packeta_pickup' || orderData.shipping_method === 'packeta_home') {
      try {
        await createPacketaPacket(orderData, response.data.id, Number(response.data.total));
      } catch (error) {
        // Log error but don't fail the order creation
        console.error('Failed to create Packeta packet:', error);
      }
    }

    return NextResponse.json({
      order: response.data
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