import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }

  // Guardrail: prevent accidentally running production with test keys.
  // This often manifests as customers seeing "test mode" / test card messaging.
  if (process.env.NODE_ENV === 'production' && stripeSecretKey.startsWith('sk_test_')) {
    throw new Error(
      'STRIPE_SECRET_KEY is a test key (sk_test_) but NODE_ENV=production. Set a live key (sk_live_).'
    );
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(stripeSecretKey, {
      typescript: true,
      telemetry: false,
    });
  }
  return stripeSingleton;
}


