import { test, expect } from '@playwright/test';

test.describe('i18n Routing', () => {
  test('root serves default locale (es) without redirect', async ({ browser }) => {
    const context = await browser.newContext({ locale: 'es-AR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await context.close();
  });

  test('supports English locale via /en prefix', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('shows 404 for unsupported locales', async ({ page }) => {
    const response = await page.goto('/fr');
    expect(response?.status()).toBe(404);
  });
});
