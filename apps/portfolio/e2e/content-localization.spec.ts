import { test, expect } from '@playwright/test';

test.describe('Content Localization', () => {
  test('should display English content by default', async ({ page }) => {
    await page.goto('/en');
    // "Projects" is the English label for the navigation
    await expect(page.getByRole('link', { name: /Projects/i }).first()).toBeVisible();
  });

  test('should display Spanish content when switched', async ({ page }) => {
    await page.goto('/es');
    // "Proyectos" is the Spanish label for the navigation
    await expect(page.getByRole('link', { name: /Proyectos/i }).first()).toBeVisible();
  });
});
