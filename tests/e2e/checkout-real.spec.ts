import { test, expect } from '@playwright/test';

const enabled = process.env.E2E_REAL === '1';

test.describe('Checkout real E2E', () => {
  test.skip(!enabled, 'Set E2E_REAL=1 to run real checkout test against configured env');

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const cart = [
        { id: 47, name: 'Najsilnejšia kĺbová výživa', price: 22.99, quantity: 1, image: '/kapsule-hero.jpeg' },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('manualDiscountLabel');
      localStorage.removeItem('manualDiscountKey');
    });
  });

  test('creates real COD order via browser and lands on success page', async ({ page }) => {
    const email = `e2e.browser.${Date.now()}@example.com`;

    await page.goto('/pokladna');

    await page.fill('#billing-first_name', 'E2E');
    await page.fill('#billing-last_name', 'Browser');
    await page.fill('#billing-email', email);
    await page.fill('#billing-phone', '+421900000000');
    await page.fill('#billing-address_1', 'Testovacia 1');
    await page.fill('#billing-city', 'Bratislava');
    await page.fill('#billing-postcode', '81101');

    await page.locator('input[name="shipping_method"][value="packeta_home"]').check();
    await page.locator('input[name="payment_method"][value="cod"]').check();
    await page.locator('input[name="termsAndPrivacy"]').check();

    await page.getByRole('button', { name: /Dokončiť objednávku/i }).click();

    await expect(page).toHaveURL(/\/objednavka\/uspesna\//, { timeout: 30_000 });
    await expect(page.getByText('Objednávka bola úspešne vytvorená!')).toBeVisible();
  });
});
