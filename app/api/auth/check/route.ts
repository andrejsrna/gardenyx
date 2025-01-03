import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = await cookieStore.get('customerToken');
    const customerId = await cookieStore.get('customerId');

    if (!token || !customerId) {
      return NextResponse.json({
        isAuthenticated: false
      });
    }

    try {
      // Use WooCommerce API to verify customer exists and get their data
      const response = await api.get(`customers/${customerId.value}`);
      
      return NextResponse.json({
        isAuthenticated: true,
        customerId: response.data.id,
        customerData: response.data
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return NextResponse.json({
        isAuthenticated: false
      });
    }

  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({
      isAuthenticated: false
    });
  }
} 