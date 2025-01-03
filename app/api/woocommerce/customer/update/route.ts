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

export async function POST(request: Request) {
  try {
    const customerId = request.headers.get('authorization')?.split(' ')[1];

    if (!customerId) {
      return NextResponse.json(
        { message: 'Nie ste prihlásený' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { billing } = body;

    try {
      const updateData = {
        email: billing.email,
        first_name: billing.first_name,
        last_name: billing.last_name,
        billing: {
          first_name: billing.first_name,
          last_name: billing.last_name,
          company: billing.company || '',
          address_1: billing.address_1,
          address_2: '',
          city: billing.city,
          state: '',
          postcode: billing.postcode,
          country: billing.country || 'SK',
          email: billing.email,
          phone: billing.phone
        }
      };

      const response = await api.put(`customers/${customerId}`, updateData);
      return NextResponse.json(response.data);
    } catch {
      return NextResponse.json({ message: 'Nepodarilo sa aktualizovať údaje' }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { message: 'Nepodarilo sa aktualizovať údaje' },
      { status: 500 }
    );
  }
} 