import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

export async function GET(request: Request) {
  try {
    if (!request.url) {
      return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const response = await api.get('orders', {
      per_page: 100,
      orderby: 'date',
      order: 'desc',
      status: ['pending', 'processing', 'on-hold', 'completed']
    });

    const orders = Array.isArray(response.data) ? response.data as Array<{ id: number; transaction_id?: string; meta_data?: Array<{ key: string; value: string }> }> : [];
    const match = orders.find(o => o.transaction_id === id || o.meta_data?.some(m => m.key === '_stripe_payment_intent_id' && m.value === id));

    if (!match) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ orderId: match.id });
  } catch {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}


