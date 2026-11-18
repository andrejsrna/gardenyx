export type StripePI = {
  id: string;
  amount?: number;
  amount_received?: number;
  status?: string;
  metadata?: Record<string, string | undefined>;
};

type OrderWhere = { where: { id: string } };
type OrderUpdate =
  | { status: 'on_hold'; meta: { create: { key: string; value: string } } }
  | { status: 'processing'; paymentStatus: 'paid'; transactionId: string; meta: { create: { key: string; value: string } } }
  | { status: 'failed'; paymentStatus: 'pending'; customerNote: string };

type WebhookConfig = {
  getStripe(): { webhooks: { constructEvent(body: Buffer, signature: string, secret: string): unknown } };
  getEndpointSecret(): string | undefined;
  order: {
    findUnique(args: OrderWhere): PromiseLike<{ total: unknown } | null>;
    update(args: OrderWhere & { data: OrderUpdate }): PromiseLike<unknown>;
  };
  ensureOrderFromPaymentIntent(pi: StripePI): Promise<unknown>;
  finalizeLinkedOrder?(id: string): Promise<unknown>;
  failedPaymentNote: string;
  logError(error: unknown): void;
};

/** Handles Stripe delivery and existing-order updates; order creation remains in the shop. */
export function createStripeWebhook(config: WebhookConfig) {
  async function handleSucceeded(pi: StripePI) {
    const id = pi.metadata?.order_id;
    if (id) {
      const where = { id };
      const order = await config.order.findUnique({ where });
      if (order) {
        const expectedCents = Number(order.total) * 100;
        if (Number.isFinite(expectedCents) && expectedCents > 0 && typeof pi.amount_received === 'number' && pi.amount_received !== expectedCents) {
          await config.order.update({ where, data: {
            status: 'on_hold',
            meta: { create: { key: '_stripe_amount_received', value: String(pi.amount_received) } },
          } });
          return;
        }
        await config.order.update({ where, data: {
          status: 'processing',
          paymentStatus: 'paid',
          transactionId: pi.id,
          meta: { create: { key: '_stripe_payment_intent_id', value: pi.id } },
        } });
        config.finalizeLinkedOrder?.(id).catch(() => null);
        return;
      }
    }
    await config.ensureOrderFromPaymentIntent(pi);
  }

  return async function POST(request: Request) {
    const stripe = config.getStripe();
    try {
      const signature = request.headers.get('stripe-signature');
      const secret = config.getEndpointSecret();
      if (!signature || !secret) {
        return Response.json({ error: 'Invalid webhook config' }, { status: 400 });
      }

      const body = Buffer.from(await request.arrayBuffer());
      let event: { type: string; data: { object: StripePI } };
      try {
        event = stripe.webhooks.constructEvent(body, signature, secret) as typeof event;
      } catch {
        return Response.json({ error: 'Signature verification failed' }, { status: 400 });
      }

      switch (event.type) {
        case 'payment_intent.succeeded':
          await handleSucceeded(event.data.object).catch(config.logError);
          break;
        case 'payment_intent.payment_failed': {
          const id = event.data.object.metadata?.order_id;
          if (id) {
            try {
              await config.order.update({ where: { id }, data: {
                status: 'failed', paymentStatus: 'pending', customerNote: config.failedPaymentNote,
              } });
            } catch {
              // Preserve acknowledgement even if the linked order cannot be updated.
            }
          }
          break;
        }
      }
      return Response.json({ received: true });
    } catch {
      return Response.json({ error: 'Webhook handler error' }, { status: 500 });
    }
  };
}
