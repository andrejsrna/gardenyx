import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
  queryStringAuth: true
});

export async function GET(request: Request) {
  try {
    const customerId = request.headers.get('authorization')?.split(' ')[1];

    if (!customerId) {
      return NextResponse.json(
        { message: 'Nie ste prihlásený' },
        { status: 401 }
      );
    }

    try {
      const response = await api.get('orders', {
        customer: parseInt(customerId, 10),
        per_page: 100
      });

      return NextResponse.json(response.data);
    } catch (error) {
      console.error('WooCommerce API error:', error);
      return NextResponse.json(
        { message: 'Nepodarilo sa načítať objednávky' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 