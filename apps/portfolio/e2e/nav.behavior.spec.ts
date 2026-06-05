import { test, expect } from '@playwright/test';

test.describe('CommandNav Behavior', () => {
  test('stays horizontally centered at bottom on desktop', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Visit home
    await page.goto('/en');

    // Wait for the nav root to be visible
    const navRoot = page.locator('.liquid-nav-root');
    await expect(navRoot).toBeVisible();

    // Check if it's horizontally centered
    // The CSS rule md:left-1/2 md:-translate-x-1/2 handles this.
    // We can evaluate the bounding box.
    const boundingBox = await navRoot.boundingBox();
    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      const centerX = boundingBox.x + boundingBox.width / 2;
      const viewportWidth = 1280;
      // Should be very close to the center of the viewport
      expect(Math.abs(centerX - viewportWidth / 2)).toBeLessThan(5); // 5px tolerance
    }
  });
});
