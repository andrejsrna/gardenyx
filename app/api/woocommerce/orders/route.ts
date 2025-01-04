import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

interface WooCommerceError extends Error {
  response?: {
    data: {
      message?: string;
      [key: string]: unknown;
    };
    status?: number;
  };
}

// Initialize the WooCommerce API with your credentials
const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    

    const response = await api.post('orders', orderData);
    

    if (!response.data || !response.data.id) {
      throw new Error('Invalid response from WooCommerce');
    }

    return NextResponse.json({
      order: response.data
    });

  } catch (error: unknown) {
    console.error('Order creation error:', error);
    
    const err = error as WooCommerceError;
    
    // Handle different types of errors
    if (err.response?.data) {
      // WooCommerce API error
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

    // Generic error
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