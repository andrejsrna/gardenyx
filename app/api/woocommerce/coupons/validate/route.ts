import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const api = new WooCommerceRestApi({
  url: process.env.WORDPRESS_URL!,
  consumerKey: process.env.WC_CONSUMER_KEY!,
  consumerSecret: process.env.WC_CONSUMER_SECRET!,
  version: 'wc/v3'
});

interface RequestBody {
  code: string;
  items: Array<{
    id: number;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

interface WooCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: 'percent' | 'fixed_cart' | 'fixed_product';
  enabled: boolean;
  date_expires: string | null;
  minimum_amount: string;
  maximum_amount: string;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number;
  usage_count: number;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { code, items, totalAmount } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Prosím zadajte kupónový kód' },
        { status: 400 }
      );
    }

    // Get coupon details from WooCommerce
    const { data: coupons } = await api.get('coupons', {
      search: code
    });

    const coupon = coupons.find((c: WooCoupon) => c.code.toLowerCase() === code.toLowerCase());

    if (!coupon) {
      return NextResponse.json(
        { message: 'Neplatný kupónový kód' },
        { status: 400 }
      );
    }

    // Validate expiration
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return NextResponse.json(
        { message: 'Platnosť kupónu vypršala' },
        { status: 400 }
      );
    }

    // Validate usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json(
        { message: 'Tento kupón už bol použitý maximálny počet krát' },
        { status: 400 }
      );
    }

    // Validate product restrictions
    if (coupon.product_ids.length > 0) {
      const validProducts = items.some(item => coupon.product_ids.includes(item.id));
      if (!validProducts) {
        return NextResponse.json(
          { message: 'Tento kupón nie je platný pre vybrané produkty' },
          { status: 400 }
        );
      }
    }

    if (coupon.excluded_product_ids.length > 0) {
      const hasExcludedProduct = items.some(item => coupon.excluded_product_ids.includes(item.id));
      if (hasExcludedProduct) {
        return NextResponse.json(
          { message: 'Tento kupón nie je platný pre niektoré produkty v košíku' },
          { status: 400 }
        );
      }
    }

    if (coupon.minimum_amount && totalAmount < parseFloat(coupon.minimum_amount)) {
      return NextResponse.json(
        { message: `Minimálna hodnota objednávky pre tento kupón je ${coupon.minimum_amount}€` },
        { status: 400 }
      );
    }

    if (coupon.maximum_amount && totalAmount > parseFloat(coupon.maximum_amount)) {
      return NextResponse.json(
        { message: `Maximálna hodnota objednávky pre tento kupón je ${coupon.maximum_amount}€` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = totalAmount * (parseFloat(coupon.amount) / 100);
    } else if (coupon.discount_type === 'fixed_cart') {
      discount = parseFloat(coupon.amount);
    }

    return NextResponse.json({
      success: true,
      discount,
      coupon
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { message: 'Nepodarilo sa overiť kupón' },
      { status: 500 }
    );
  }
} 