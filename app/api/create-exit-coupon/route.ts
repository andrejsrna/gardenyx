import { NextResponse } from 'next/server';

// Prevent client-side access
export const dynamic = 'force-dynamic'; // If using App Router
export const config = {
  runtime: 'edge', // Consider edge runtime for better security
};

// Add rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Get Redis credentials from environment variables
const redisUrl = process.env.REDIS_URL || '';
const redisPassword = process.env.REDIS_PASSWORD || '';

// Extract host and port from Redis URL
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

const url = new URL(redisUrl);
const host = url.hostname;
const port = url.port;

// Create Redis client with Upstash REST API format
const redis = new Redis({
  url: `https://${host}:${port}`,
  token: redisPassword,
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
});

const generateCouponCode = () => {
  // Use crypto.randomUUID for stronger uniqueness, take first 8 chars
  const uniquePart = crypto.randomUUID().substring(0, 8).toUpperCase();
  return `EXIT-${uniquePart}`;
};

const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export async function POST(request: Request) {
  // Set expiration to next day at 23:59:59
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59);

  const couponData = {
    code: generateCouponCode(),
    discount_type: 'percent',
    amount: '10.00',
    individual_use: true,
    usage_limit: 1,
    usage_limit_per_user: 1,
    date_expires: formatDate(tomorrow),
    minimum_amount: '0.00',
    maximum_amount: '9999999999999.00',
    product_ids: [],
    excluded_product_ids: [],
    email_restrictions: [],
    free_shipping: false,
    exclude_sale_items: false,
    description: 'Exit intent coupon - 10% off'
  };

  if (!process.env.WC_CONSUMER_KEY || !process.env.WC_CONSUMER_SECRET) {
    return NextResponse.json(
      { error: 'Missing WooCommerce credentials' },
      { status: 500 }
    );
  }

  try {
    // Verify credentials are correct - Use btoa for Edge compatibility
    const authString = btoa(`${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`);

    // Add to handler
    const { success } = await ratelimit.limit(request.headers.get('cf-connecting-ip') ?? 'anonymous');
    if (!success) return new Response('Too Many Requests', { status: 429 });

    // Create the coupon
    const response = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wc/v3/coupons`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(couponData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.code === 'woocommerce_rest_coupon_code_already_exists') {
        return POST(request); // Retry with new code
      }
      console.error('WooCommerce API Error:', errorData);
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();

    return NextResponse.json({ code: data.code }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Full error details:', {
      message,
      couponData,
      validationError: error instanceof Error ? error.stack : null
    });
    // Return generic error in production, detailed in development
    const responseError = process.env.NODE_ENV === 'production'
        ? { error: 'Coupon creation failed' }
        : { error: 'Coupon creation failed', details: message };

    return NextResponse.json(
      responseError,
      { status: 500 }
    );
  }
}
