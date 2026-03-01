import assert from 'node:assert/strict';

import {
  PRODUCT_VAT_RATE,
  SHIPPING_VAT_RATE,
  PRODUCT_VAT_PERCENT,
  SHIPPING_VAT_PERCENT,
  SHIPPING_COST_PACKETA_HOME_NET,
  SHIPPING_COST_PACKETA_PICKUP_NET,
} from '../app/lib/pricing/constants.ts';
import {
  grossFromNet,
  netFromGross,
  taxFromGross,
  taxFromNet,
  round2,
} from '../app/lib/pricing/math.ts';

function run() {
  // 1) Constants sanity
  assert.equal(PRODUCT_VAT_PERCENT, 19, 'Product VAT percent should be 19');
  assert.equal(SHIPPING_VAT_PERCENT, 23, 'Shipping VAT percent should be 23');
  assert.equal(SHIPPING_COST_PACKETA_PICKUP_NET, 2.9, 'Packeta pickup net mismatch');
  assert.equal(SHIPPING_COST_PACKETA_HOME_NET, 3.8, 'Packeta home net mismatch');

  // 2) Math roundtrip for product VAT
  const productNet = 10;
  const productGross = grossFromNet(productNet, PRODUCT_VAT_RATE);
  assert.equal(productGross, 11.9, 'Product gross should be 11.90');
  assert.equal(netFromGross(productGross, PRODUCT_VAT_RATE), 10, 'Product net roundtrip failed');
  assert.equal(taxFromNet(productNet, PRODUCT_VAT_RATE), 1.9, 'Product tax from net failed');
  assert.equal(taxFromGross(productGross, PRODUCT_VAT_RATE), 1.9, 'Product tax from gross failed');

  // 3) Math roundtrip for shipping VAT
  const shippingNetPickup = SHIPPING_COST_PACKETA_PICKUP_NET;
  const shippingGrossPickup = grossFromNet(shippingNetPickup, SHIPPING_VAT_RATE);
  assert.equal(shippingGrossPickup, 3.57, 'Shipping pickup gross should be 3.57');
  assert.equal(taxFromNet(shippingNetPickup, SHIPPING_VAT_RATE), 0.67, 'Shipping pickup tax should be 0.67');
  assert.equal(netFromGross(shippingGrossPickup, SHIPPING_VAT_RATE), shippingNetPickup, 'Shipping pickup net roundtrip failed');

  const shippingNetHome = SHIPPING_COST_PACKETA_HOME_NET;
  const shippingGrossHome = grossFromNet(shippingNetHome, SHIPPING_VAT_RATE);
  assert.equal(shippingGrossHome, 4.67, 'Shipping home gross should be 4.67');
  assert.equal(taxFromNet(shippingNetHome, SHIPPING_VAT_RATE), 0.87, 'Shipping home tax should be 0.87');

  // 4) Checkout scenario consistency (manual bundle discount + pickup)
  const subtotalGross = 80.94;
  const discount = 10;
  const subtotalAfterDiscount = round2(Math.max(0, subtotalGross - discount));
  const checkoutTotal = round2(subtotalAfterDiscount + shippingGrossPickup);

  assert.equal(subtotalAfterDiscount, 70.94, 'Subtotal after discount mismatch');
  assert.equal(checkoutTotal, 74.51, 'Checkout total mismatch for scenario');

  // 5) Derived tax consistency
  const productTax = taxFromGross(subtotalAfterDiscount, PRODUCT_VAT_RATE);
  const totalTax = round2(productTax + taxFromGross(shippingGrossPickup, SHIPPING_VAT_RATE));
  assert.equal(totalTax, round2(11.33 + 0.67), 'Total tax mismatch');

  console.log('✅ Pricing tests passed');
}

run();
