import { test, expect } from "@playwright/test";

test.describe("Layer 2: Cookie Consent Banner", () => {
  test("displays the cookie banner on initial load without consent", async ({ page }) => {
    await page.goto("/");

    // We shouldn't have any consent preference set yet
    const banner = page.locator('aside[aria-label="Cookie Consent"]');
    await expect(banner).toBeVisible();

    const acceptButton = banner.locator('button:has-text("Accept")');
    await expect(acceptButton).toBeVisible();
  });

  test("accepts cookies and dismisses banner persistently", async ({ page }) => {
    await page.goto("/");

    const banner = page.locator('aside[aria-label="Cookie Consent"]');
    await expect(banner).toBeVisible();

    const acceptButton = banner.locator('button:has-text("Accept")');
    await acceptButton.click();

    // The banner should disappear
    await expect(banner).toBeHidden();

    // Check localStorage
    const consent = await page.evaluate(() => localStorage.getItem("consent_preferences"));
    expect(consent).toContain('"analytics":true');

    // Reload the page, banner should remain hidden
    await page.reload();
    await expect(banner).toBeHidden();
  });

  test("respects Global Privacy Control (GPC) and auto-rejects", async ({ page }) => {
    // Mock GPC flag BEFORE navigation
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "globalPrivacyControl", {
        value: true,
        configurable: true,
      });
    });

    await page.goto("/");

    // Local storage should reflect rejection eventually (wait for hydration/useEffect)
    await expect.poll(async () => {
      const consent = await page.evaluate(() => localStorage.getItem("consent_preferences"));
      return consent !== null ? consent : "";
    }, { timeout: 5000 }).toContain('"analytics":false');

    // The banner should not be displayed because GPC auto-rejected
    const banner = page.locator('aside[aria-label="Cookie Consent"]');
    await expect(banner).toBeHidden();
  });
});
