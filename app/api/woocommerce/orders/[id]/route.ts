import { NextResponse } from 'next/server';
import axios from 'axios';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();

    const url = `${WORDPRESS_URL}/wp-json/wc/v3/orders/${id}`;

    const response = await axios.put(url, updateData, {
      params: {
        consumer_key: WOO_CONSUMER_KEY,
        consumer_secret: WOO_CONSUMER_SECRET
      },
      headers: {
        'Content-Type': 'application/json',
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    if (response.status >= 400) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error updating order:', error);
    if (axios.isAxiosError(error)) {
      return NextResponse.json({
        error: 'WooCommerce API error',
        details: error.response?.data || error.message,
      }, { status: error.response?.status || 500 });
    }
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
} 