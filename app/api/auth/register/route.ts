import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WOO_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY;
const WOO_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_CONSUMER_SECRET;

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    try {
      await limiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { error: 'Príliš veľa pokusov. Skúste to znova neskôr.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    const { first_name, last_name, email, password, phone, address_1, city, postcode, country } = body;

    // Check if user exists first
    const checkUserResponse = await fetch(
      `${WORDPRESS_URL}/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`).toString('base64')}`
        }
      }
    );

    const existingUsers = await checkUserResponse.json();

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'email-exists' },
        { status: 400 }
      );
    }

    // Create customer in WooCommerce
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wc/v3/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WOO_CONSUMER_KEY}:${WOO_CONSUMER_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        email,
        first_name,
        last_name,
        username: email,
        password,
        billing: {
          first_name,
          last_name,
          email,
          phone,
          address_1,
          city,
          postcode,
          country,
        },
        shipping: {
          first_name,
          last_name,
          address_1,
          city,
          postcode,
          country,
        }
      })
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('WooCommerce API error:', responseData);
      
      if (responseData.code === 'registration-error-email-exists') {
        return NextResponse.json(
          { error: 'email-exists' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: responseData.message || 'Registrácia zlyhala. Skúste to prosím znova.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, customer: responseData });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registrácia zlyhala. Skúste to prosím znova neskôr.' },
      { status: 500 }
    );
  }
} 