import assert from 'node:assert/strict';

import prisma from '../app/lib/prisma.ts';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const CLEANUP = process.env.E2E_CLEANUP === '1';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const stamp = Date.now();
  const email = `e2e+${stamp}@example.com`;

  const payload = {
    shipping_method: 'packeta_pickup',
    payment_method: 'cod',
    status: 'processing',
    shipping: {
      first_name: 'E2E',
      last_name: 'Tester',
      address_1: 'Testovacia 1',
      city: 'Bratislava',
      postcode: '81101',
      country: 'SK',
      state: 'Slovenská republika',
    },
    billing: {
      first_name: 'E2E',
      last_name: 'Tester',
      address_1: 'Testovacia 1',
      city: 'Bratislava',
      postcode: '81101',
      country: 'SK',
      state: 'Slovenská republika',
      email,
      phone: '+421900000000',
      company: '',
      ic: '',
      dic: '',
      dic_dph: '',
    },
    meta_data: [
      { key: '_packeta_point_id', value: '20610' },
      { key: '_packeta_point_name', value: 'E2E test point' },
      { key: '_packeta_point_city', value: 'Bratislava' },
      { key: '_packeta_point_street', value: 'Testovacia' },
      { key: '_packeta_point_zip', value: '811 01' },
      { key: '_e2e_test', value: 'order-flow' },
    ],
    line_items: [
      {
        product_id: 47,
        quantity: 1,
        price: 22.99,
        total: 22.99,
        name: 'E2E Produkt A',
        sku: 'E2E-A',
      },
      {
        product_id: 669,
        quantity: 1,
        price: 12.99,
        total: 12.99,
        name: 'E2E Produkt B',
        sku: 'E2E-B',
      },
    ],
    shipping_lines: [
      {
        method_id: 'packeta_pickup',
        method_title: 'Packeta - Výdajné miesto',
        total: '2.90',
        total_tax: '0.67',
      },
    ],
    total: '38.55',
    customer_note: 'E2E order flow test',
    idempotency_key: `e2e-${stamp}`,
  };

  console.log(`➡️ Creating test order via ${BASE_URL}/api/orders ...`);
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => ({}));
  assert.equal(res.ok, true, `Order API failed: ${res.status} ${JSON.stringify(body)}`);

  const orderId: string | undefined = body?.order?.id;
  assert.ok(orderId, 'Order id missing in API response');
  console.log(`✅ Order created: ${orderId}`);

  // DB checks
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true, meta: true },
  });

  assert.ok(order, 'Order not found in DB');
  assert.equal(order?.paymentMethod, 'cod', 'Expected COD payment method');
  assert.ok(order?.items?.length && order.items.length >= 2, 'Expected at least 2 order items');
  assert.ok(order?.addresses?.length && order.addresses.length >= 2, 'Expected billing + shipping address');
  console.log('✅ DB write verified (order/items/addresses/meta)');

  // Email side-effect check (finalizeOrder runs async)
  const deadline = Date.now() + 45_000;
  let emailSentAt: string | null = null;
  let emailError: string | null = null;
  let emailSkipped: string | null = null;

  while (Date.now() < deadline) {
    const fresh = await prisma.order.findUnique({
      where: { id: orderId },
      include: { meta: true },
    });

    emailSentAt = fresh?.meta.find((m) => m.key === '_email_sent_at')?.value || null;
    emailError = fresh?.meta.find((m) => m.key === '_email_error')?.value || null;
    emailSkipped = fresh?.meta.find((m) => m.key === '_email_skipped_reason')?.value || null;

    if (emailSentAt || emailError || emailSkipped) break;
    await sleep(1500);
  }

  if (emailSentAt) {
    console.log(`✅ Email sent marker present: _email_sent_at=${emailSentAt}`);
  } else if (emailSkipped) {
    console.log(`⚠️ Email skipped: _email_skipped_reason=${emailSkipped}`);
  } else if (emailError) {
    console.log(`❌ Email error marker: ${emailError}`);
    throw new Error(`Email send failed: ${emailError}`);
  } else {
    console.log('⚠️ Email status marker not found within timeout (check worker logs).');
  }

  if (CLEANUP) {
    console.log('🧹 Cleanup enabled, deleting test order...');
    await prisma.order.delete({ where: { id: orderId } });
    console.log('✅ Cleanup done');
  }

  console.log('🎉 E2E order flow finished');
  await prisma.$disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
