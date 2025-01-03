import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3',
  queryStringAuth: true
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email je povinný' },
        { status: 400 }
      );
    }

    try {
      // First, try to find the customer in WooCommerce
      const { data: customers } = await api.get('customers', {
        email: email,
        per_page: 1
      });

      if (!customers || customers.length === 0) {
        return NextResponse.json(
          { message: 'Používateľ s týmto emailom nebol nájdený' },
          { status: 404 }
        );
      }

      // Now use WordPress password reset
      const response = await fetch(`${process.env.WORDPRESS_URL}/wp-login.php?action=lostpassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `user_login=${encodeURIComponent(email)}&redirect_to=&wp-submit=Get+New+Password`,
      });

      if (!response.ok) {
        return NextResponse.json(
          { message: 'Nepodarilo sa odoslať email na obnovenie hesla' },
          { status: response.status }
        );
      }

      return NextResponse.json({
        message: 'Email na obnovenie hesla bol odoslaný'
      });
    } catch (error) {
      console.error('WooCommerce API error:', error);
      return NextResponse.json(
        { message: 'Nepodarilo sa nájsť používateľa' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Nepodarilo sa spracovať požiadavku' },
      { status: 500 }
    );
  }
} 