import { test, expect, type Page } from '@playwright/test';

test.describe('Checkout mocked E2E', () => {
  const fillCheckoutForm = async (page: Page) => {
    await page.fill('#billing-first_name', 'E2E');
    await page.fill('#billing-last_name', 'Tester');
    await page.fill('#billing-email', 'e2e@example.com');
    await page.fill('#billing-phone', '+421900000000');
    await page.fill('#billing-address_1', 'Testovacia 1');
    await page.fill('#billing-city', 'Bratislava');
    await page.fill('#billing-postcode', '81101');
  };

  const mockOrderCreate = async (page: Page) => {
    let capturedOrderPayload: any = null;

    await page.route('**/api/orders', async (route) => {
      const req = route.request();
      if (req.method() === 'POST') {
        capturedOrderPayload = req.postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            order: {
              id: 'e2e-mock-order-1',
            },
            isExisting: false,
          }),
        });
        return;
      }
      await route.continue();
    });

    return {
      getCapturedOrderPayload: () => capturedOrderPayload,
    };
  };

  const acceptTerms = async (page: Page) => {
    const checkbox = page.locator('input[name="termsAndPrivacy"]');
    await checkbox.evaluate((element) => {
      (element as HTMLInputElement).click();
    });
    await expect(checkbox).toBeChecked();
  };

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem('cart');
      localStorage.removeItem('appliedCoupon');
      localStorage.removeItem('manualDiscountLabel');
      localStorage.removeItem('manualDiscountKey');
    });
  });

  test('submits COD order and redirects to success (mocked API)', async ({ page }) => {
    const { getCapturedOrderPayload } = await mockOrderCreate(page);

    await page.addInitScript(() => {
      const cart = [
        { id: 47, name: 'Najsilnejšia kĺbová výživa', price: 22.99, quantity: 1, image: '/kapsule-hero.jpeg' },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    await page.goto('/pokladna');

    await fillCheckoutForm(page);

    await page.getByLabel(/Packeta - Doručenie domov/i).click();
    await page.getByLabel(/Dobierka/i).click();
    await acceptTerms(page);

    const submit = page.getByRole('button', { name: /Dokončiť objednávku/i });
    await expect(submit).toBeEnabled();
    await submit.click();

    await expect.poll(() => getCapturedOrderPayload() !== null).toBeTruthy();
    await expect(page).toHaveURL(/\/objednavka\/uspesna\/e2e-mock-order-1/, { timeout: 15_000 });

    const capturedOrderPayload = getCapturedOrderPayload();
    expect(capturedOrderPayload).toBeTruthy();
    expect(capturedOrderPayload.payment_method).toBe('cod');
    expect(capturedOrderPayload.shipping_method).toBe('packeta_home');
    expect(Array.isArray(capturedOrderPayload.shipping_lines)).toBe(true);
    expect(capturedOrderPayload.shipping_lines[0].total).toBe('3.80');
    expect(capturedOrderPayload.shipping_lines[0].total_tax).toBe('0.87');
  });

  test('completes checkout from shop through product detail and cart (mocked API)', async ({ page }) => {
    const { getCapturedOrderPayload } = await mockOrderCreate(page);

    await page.goto('/kupit');
    await expect(page.getByRole('heading', { name: /Naše produkty/i })).toBeVisible();

    await page.getByRole('link', { name: /Detail produktu/i }).first().click();
    await expect(page).toHaveURL(/\/produkt\//);

    await page.locator('#add-to-cart-top').click();
    await expect(page.getByText('Produkt pridaný do košíka')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Košík \(/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Pokračovať do pokladne/i })).toBeVisible();

    await page.getByRole('link', { name: /Pokračovať do pokladne/i }).click();
    await expect(page).toHaveURL('/pokladna');

    await fillCheckoutForm(page);

    await page.getByLabel(/Packeta - Doručenie domov/i).click();
    await page.getByLabel(/Dobierka/i).click();
    await acceptTerms(page);

    await page.getByRole('button', { name: /Dokončiť objednávku/i }).click();

    await expect.poll(() => getCapturedOrderPayload() !== null).toBeTruthy();
    await expect(page).toHaveURL(/\/objednavka\/uspesna\/e2e-mock-order-1/, { timeout: 15_000 });

    const capturedOrderPayload = getCapturedOrderPayload();
    expect(capturedOrderPayload.line_items).toHaveLength(1);
    expect(capturedOrderPayload.payment_method).toBe('cod');
    expect(capturedOrderPayload.shipping_method).toBe('packeta_home');
  });
});
