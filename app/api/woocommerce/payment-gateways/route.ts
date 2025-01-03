import { NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET;

export async function GET() {
  try {
    const response = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/payment_gateways?consumer_key=${WOO_CONSUMER_KEY}&consumer_secret=${WOO_CONSUMER_SECRET}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payment gateways');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching payment gateways:', error);
    return NextResponse.json({ error: 'Failed to fetch payment gateways' }, { status: 500 });
  }
} 