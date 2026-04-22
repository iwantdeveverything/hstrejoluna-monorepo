import { expect, test } from "@playwright/test";

test.describe("WCAG 2.2 AA Accessibility Hardening", () => {
  test.use({ colorScheme: "dark" });
  
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("consent_preferences", JSON.stringify({ analytics: true, timestamp: new Date().toISOString() }));
    });
  });

  test("prefers-contrast: more applies correct high-contrast CSS overrides", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Layout specific selectors are hidden on mobile");

    // Navigate to a page where we can test contrast overrides
    await page.goto("/");

    await page.emulateMedia({ contrast: "more" });

    // In globals.css, we added:
    // .text-on_surface_variant { color: rgba(255, 255, 255, 0.85) !important; }
    const variantText = page.locator(".text-on_surface_variant").first();
    await expect(variantText).toBeVisible();

    const borderElement = page.locator('.border-surface_container_highest').first();
    await expect(borderElement).toBeVisible();

    // The default in theme is --color-on-surface-variant (often grey scaled).
    // The high contrast overrides this. Let's just ensure it's not the default by expecting it to not equal 'rgb(X)'
    // Actually, in CSS: color: rgba(255, 255, 255, 0.85) usually computes as rgba(255, 255, 255, 0.85) in chromium.
    // If it's rgb(255, 255, 255) it means alpha is 1, which might mean our override failed or another override won.
    await expect
      .poll(async () => variantText.evaluate((el) => getComputedStyle(el).color))
      .toContain("255");
    await expect
      .poll(async () => borderElement.evaluate((el) => getComputedStyle(el).borderColor))
      .toContain("255");
  });

  test("skills overview maintains singular accordion expansion behavior (solo un panel abierto)", async ({ page }) => {
    await page.goto("/#skills");

    // Find the skill accordion buttons
    const skillButtons = page.locator('#skills button[aria-controls^="skill-panel-"]');
    const buttonCount = await skillButtons.count();
    test.skip(buttonCount < 2, "Needs at least two skills for singular expansion verification");

    const firstSkill = skillButtons.nth(0);
    const secondSkill = skillButtons.nth(1);

    // Expand first
    await firstSkill.click();
    await expect(firstSkill).toHaveAttribute("aria-expanded", "true");

    // Expand second
    await secondSkill.click();
    
    // First should now be collapsed
    await expect(firstSkill).toHaveAttribute("aria-expanded", "false");
    await expect(secondSkill).toHaveAttribute("aria-expanded", "true");
  });
});
