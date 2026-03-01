import { test, expect } from '@playwright/test';

test.describe('Checkout summary', () => {
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

  test('can increase and decrease quantity from order summary', async ({ page }) => {
    await page.goto('/pokladna');

    await expect(page.getByText('Súhrn objednávky')).toBeVisible();

    const increase = page.getByRole('button', { name: /Zvýšiť množstvo produktu/i }).first();
    const decrease = page.getByRole('button', { name: /Znížiť množstvo produktu/i }).first();

    await increase.click();
    await expect(page.getByText('45.98 €').first()).toBeVisible();

    await decrease.click();
    await expect(page.getByText('22.99 €').first()).toBeVisible();
  });

  test('shows shipping VAT row as 23% in summary', async ({ page }) => {
    await page.goto('/pokladna');

    const pickupOption = page.getByLabel(/Packeta - Výdajné miesto/i).first();
    await pickupOption.click();

    await expect(page.getByText('DPH dopravy (23%)')).toBeVisible();
  });
});
