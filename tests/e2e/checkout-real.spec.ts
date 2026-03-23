import fs from 'node:fs';
import path from 'node:path';

import { test, expect, type Page, type Frame } from '@playwright/test';
import { Client } from 'pg';

const enabled = process.env.E2E_REAL === '1';

const ensureDbEnv = () => {
  if (process.env.POSTGRES_URL || process.env.POSTGRES_URL_PRISMA) return;

  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    if ((key === 'POSTGRES_URL' || key === 'POSTGRES_URL_PRISMA') && !process.env[key]) {
      process.env[key] = value;
    }
  }
};

test.describe('Checkout real E2E', () => {
  test.skip(!enabled, 'Set E2E_REAL=1 to run real checkout test against configured env');

  const fillCheckoutForm = async (page: Page, email: string) => {
    await page.fill('#billing-first_name', 'E2E');
    await page.fill('#billing-last_name', 'Browser');
    await page.fill('#billing-email', email);
    await page.fill('#billing-phone', '+421900000000');
    await page.fill('#billing-address_1', 'Testovacia 1');
    await page.fill('#billing-city', 'Bratislava');
    await page.fill('#billing-postcode', '81101');
  };

  const acceptTerms = async (page: Page) => {
    const checkbox = page.locator('input[name="termsAndPrivacy"]');
    await checkbox.evaluate((element) => {
      (element as HTMLInputElement).click();
    });
    await expect(checkbox).toBeChecked();
  };

  const startCheckoutFromShop = async (page: Page) => {
    await page.goto('/kupit');
    await expect(page.getByRole('heading', { name: /Naše produkty/i })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: /Detail produktu/i }).first().click();
    await expect(page).toHaveURL(/\/produkt\//);

    await page.locator('#add-to-cart-top').click();
    await expect(page.getByRole('heading', { name: /Košík \(/i })).toBeVisible();
    await page.getByRole('link', { name: /Pokračovať do pokladne/i }).click();
    await expect(page).toHaveURL('/pokladna');
  };

  const mockPacketaPointSelection = async (page: Page) => {
    await page.route('https://widget.packeta.com/v6/www/js/library.js', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.Packeta = {
            Widget: {
              pick: function (_apiKey, callback) {
                setTimeout(function () {
                  callback({
                    id: '20610',
                    name: 'E2E Packeta point',
                    city: 'Bratislava',
                    street: 'Testovacia 1',
                    zip: '811 01',
                    country: 'sk'
                  });
                }, 50);
              }
            }
          };
        `,
      });
    });
  };

  const fillStripeTestCard = async (page: Page) => {
    let stripeFrame: Frame | null = null;

    await expect
      .poll(
        async () => {
          for (const frame of page.frames()) {
            const url = frame.url() || '';
            if (!url.includes('js.stripe.com')) continue;

            const numberInput = frame.locator('input[name="number"]');
            if (await numberInput.count()) {
              stripeFrame = frame;
              return 'ready';
            }

            const cardOption = frame.getByText(/^Card$/);
            if (await cardOption.count()) {
              await cardOption.click().catch(() => null);
              if (await numberInput.count()) {
                stripeFrame = frame;
                return 'ready';
              }
            }
          }
          return 'waiting';
        },
        { timeout: 30_000, intervals: [500, 1000, 2000] }
      )
      .toBe('ready');

    if (!stripeFrame) {
      throw new Error('Stripe frame with card inputs not found');
    }

    const sf: Frame = stripeFrame;
    await sf.locator('input[name="number"]').fill('4242424242424242');
    await sf.locator('input[name="expiry"]').fill('1234');
    await sf.locator('input[name="cvc"]').fill('123');

    const country = sf.locator('select[name="country"]');
    if (await country.count()) {
      await country.selectOption({ label: 'Slovakia' });
    }
  };

  const expectStripeOrderInDb = async (email: string) => {
    ensureDbEnv();
    const schema = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
    const connectionString = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
    const client = new Client({ connectionString });
    await client.connect();

    try {
      await expect
        .poll(
          async () => {
            const result = await client.query(
              `
                SELECT
                  o."shippingMethod" AS "shippingMethod",
                  o."packetaPointName" AS "packetaPointName",
                  o."paymentMethod" AS "paymentMethod"
                FROM "${schema}"."Order" o
                INNER JOIN "${schema}"."OrderAddress" a
                  ON a."orderId" = o."id"
                 AND a."type" = 'BILLING'
                WHERE a."email" = $1
                ORDER BY o."createdAt" DESC
                LIMIT 1
              `,
              [email]
            );

            const order = result.rows[0] as
              | { shippingMethod: string | null; packetaPointName: string | null; paymentMethod: string | null }
              | undefined;

            return order
              ? {
                  shippingMethod: order.shippingMethod,
                  packetaPointName: order.packetaPointName,
                  paymentMethod: order.paymentMethod,
                }
              : null;
          },
          { timeout: 20_000, intervals: [500, 1000, 2000] }
        )
        .toEqual({
          shippingMethod: 'packeta_pickup',
          packetaPointName: 'E2E Packeta point',
          paymentMethod: 'stripe',
        });
    } finally {
      await client.end();
    }
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('manualDiscountLabel');
      localStorage.removeItem('manualDiscountKey');
      localStorage.setItem('cookieConsentDetails', JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true,
      }));
      document.cookie = 'cookieConsent=true; path=/';
    });
  });

  test('creates real COD order via browser and lands on success page', async ({ page }) => {
    const email = `e2e.browser.${Date.now()}@example.com`;

    await startCheckoutFromShop(page);

    await fillCheckoutForm(page, email);

    await page.getByLabel(/Packeta - Doručenie domov/i).click();
    await page.getByLabel(/Dobierka/i).click();
    await acceptTerms(page);

    await page.getByRole('button', { name: /Dokončiť objednávku/i }).click();

    await expect(page).toHaveURL(/\/objednavka\/uspesna\//, { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Objednávka bola úspešne vytvorená!' })).toBeVisible();
  });

  test('creates real Stripe order with Packeta pickup point via browser', async ({ page }) => {
    test.setTimeout(90_000);
    const email = `e2e.stripe.${Date.now()}@example.com`;

    await mockPacketaPointSelection(page);
    await startCheckoutFromShop(page);

    await fillCheckoutForm(page, email);

    await page.getByLabel(/Packeta - Výdajné miesto/i).click();
    await expect(page.getByText(/E2E Packeta point/i)).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/Platobná karta/i).click();
    await acceptTerms(page);

    await page.getByRole('button', { name: /Dokončiť objednávku/i }).click();
    await expect(page.getByRole('heading', { name: /Platba kartou/i })).toBeVisible({ timeout: 30_000 });

    await fillStripeTestCard(page);

    await page.getByRole('button', { name: /^Zaplatiť$/i }).click();

    await expect(page).toHaveURL(/\/objednavka\/uspesna\//, { timeout: 45_000 });
    await expect(page.getByRole('heading', { name: 'Objednávka bola úspešne vytvorená!' })).toBeVisible();
    await expectStripeOrderInDb(email);
  });
});

