import { test, expect } from '@playwright/test';

test.describe('i18n Routing', () => {
  test('should redirect root to default locale (en)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('should support manual locale switching via URL', async ({ page }) => {
    await page.goto('/es');
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.goto('/en');
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('should show 404 for unsupported locales', async ({ page }) => {
    const response = await page.goto('/fr');
    expect(response?.status()).toBe(404);
  });
});
