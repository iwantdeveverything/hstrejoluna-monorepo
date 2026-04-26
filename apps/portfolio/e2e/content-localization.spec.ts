import { test, expect } from '@playwright/test';

test.describe('Content Localization', () => {
  test('should display English content at /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // "Initiate Sequence" is the English CTA — always visible regardless of viewport
    await expect(page.getByText(/initiate sequence/i).first()).toBeVisible();
  });

  test('should display Spanish content at root', async ({ browser }) => {
    // Use a Spanish locale context so next-intl serves es without redirect
    const context = await browser.newContext({ locale: 'es-AR' });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    // "Iniciar Secuencia" is the Spanish CTA — always visible regardless of viewport
    await expect(page.getByText(/iniciar secuencia/i).first()).toBeVisible();
    await context.close();
  });
});
