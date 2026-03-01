import assert from 'node:assert/strict';

import { SHIPPING_VAT_RATE } from '../app/lib/pricing/constants.ts';
import { grossFromNet, netFromGross, taxFromGross, taxFromNet, round2 } from '../app/lib/pricing/math.ts';

function simulatePaymentIntentShippingMeta(shippingNet: number) {
  const sc = grossFromNet(shippingNet, SHIPPING_VAT_RATE).toFixed(2); // gross
  const sct = shippingNet.toFixed(2); // net
  const sctx = taxFromNet(shippingNet, SHIPPING_VAT_RATE).toFixed(2); // tax
  return { sc, sct, sctx };
}

function simulateFinalizeFallbackFromGross(sc: string) {
  const gross = Number(sc || 0);
  return {
    total: netFromGross(gross, SHIPPING_VAT_RATE).toFixed(2),
    total_tax: taxFromGross(gross, SHIPPING_VAT_RATE).toFixed(2),
  };
}

function run() {
  // pickup
  const pickupNet = 2.9;
  const pickupMeta = simulatePaymentIntentShippingMeta(pickupNet);
  assert.equal(pickupMeta.sc, '3.57');
  assert.equal(pickupMeta.sct, '2.90');
  assert.equal(pickupMeta.sctx, '0.67');

  const pickupFinalize = simulateFinalizeFallbackFromGross(pickupMeta.sc);
  assert.equal(pickupFinalize.total, pickupMeta.sct, 'Finalize fallback net must match payment-intent sct');
  assert.equal(pickupFinalize.total_tax, pickupMeta.sctx, 'Finalize fallback tax must match payment-intent sctx');

  // home
  const homeNet = 3.8;
  const homeMeta = simulatePaymentIntentShippingMeta(homeNet);
  assert.equal(homeMeta.sc, '4.67');
  assert.equal(homeMeta.sct, '3.80');
  assert.equal(homeMeta.sctx, '0.87');

  const homeFinalize = simulateFinalizeFallbackFromGross(homeMeta.sc);
  assert.equal(homeFinalize.total, homeMeta.sct);
  assert.equal(homeFinalize.total_tax, homeMeta.sctx);

  // final total example consistency
  const subtotalAfterDiscount = 70.94;
  const total = round2(subtotalAfterDiscount + Number(pickupMeta.sc));
  assert.equal(total, 74.51);

  console.log('✅ Stripe metadata consistency tests passed');
}

run();
