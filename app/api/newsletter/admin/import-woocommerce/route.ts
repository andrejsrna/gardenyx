import { NextResponse } from 'next/server';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import prisma from '../../../../lib/prisma';
import { upsertBrevoContact } from '../../../../lib/newsletter/brevo';

const isAuthorized = (request: Request) => {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token) return false;
  return request.headers.get('x-admin-token') === token;
};

const createWooCommerceClient = () => {
  const url = process.env.WORDPRESS_URL;
  const consumerKey = process.env.WC_CONSUMER_KEY;
  const consumerSecret = process.env.WC_CONSUMER_SECRET;

  if (!url || !consumerKey || !consumerSecret) {
    throw new Error('Missing WooCommerce credentials (WORDPRESS_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET)');
  }

  return new WooCommerceRestApi({
    url,
    consumerKey,
    consumerSecret,
    version: 'wc/v3',
  });
};

type WooOrder = {
  id: number;
  billing?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const api = createWooCommerceClient();
    const perPage = 100;
    let page = 1;
    let fetchedOrders = 0;
    const seen = new Map<
      string,
      { firstName?: string; lastName?: string; source: string }
    >();

    // Paginate through all orders
    while (true) {
      const { data } = await api.get('orders', { per_page: perPage, page });
      const orders = data as WooOrder[];
      if (!orders.length) break;

      fetchedOrders += orders.length;

      orders.forEach((order) => {
        const rawEmail = order.billing?.email?.trim().toLowerCase();
        if (!rawEmail) return;
        if (!seen.has(rawEmail)) {
          seen.set(rawEmail, {
            firstName: order.billing?.first_name || undefined,
            lastName: order.billing?.last_name || undefined,
            source: 'woocommerce-order',
          });
        }
      });

      if (orders.length < perPage) break;
      page += 1;
    }

    let inserted = 0;
    let updated = 0;
    let brevoSynced = 0;
    const brevoListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
    const shouldSyncBrevo = Boolean(process.env.BREVO_API_KEY);

    for (const [email, meta] of Array.from(seen.entries())) {
      const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
      if (existing) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            firstName: meta.firstName,
            lastName: meta.lastName,
            source: existing.source || meta.source,
            status: 'active',
            unsubscribedAt: null,
          },
        });
        updated += 1;
      } else {
        await prisma.newsletterSubscriber.create({
          data: {
            email,
            firstName: meta.firstName,
            lastName: meta.lastName,
            source: meta.source,
            status: 'active',
          },
        });
        inserted += 1;
      }

      if (shouldSyncBrevo) {
        try {
          await upsertBrevoContact({
            email,
            firstName: meta.firstName,
            lastName: meta.lastName,
            listId: brevoListId,
          });
          brevoSynced += 1;
        } catch (error) {
          console.warn('[newsletter-import] Brevo sync failed for', email, error);
        }
      }
    }

    return NextResponse.json({
      fetchedOrders,
      uniqueEmails: seen.size,
      inserted,
      updated,
      brevoSynced: shouldSyncBrevo ? brevoSynced : 'skipped (BREVO_API_KEY not set)',
    });
  } catch (error) {
    console.error('[newsletter-import] error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
