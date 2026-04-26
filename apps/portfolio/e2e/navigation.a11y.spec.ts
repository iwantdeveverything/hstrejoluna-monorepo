import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("portfolio accessibility", () => {
  test("home page has no critical accessibility violations", async ({ page }) => {
    await page.goto("/");

    const analysis = await new AxeBuilder({ page }).analyze();
    const criticalViolations = analysis.violations.filter(
      (violation) => violation.impact === "critical"
    );

    expect(
      criticalViolations,
      `Critical violations found: ${criticalViolations
        .map((violation) => `${violation.id}: ${violation.help}`)
        .join(", ")}`
    ).toEqual([]);
  });

  test("desktop keyboard navigation keeps logical tab order with visible focus", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only keyboard flow");

    await page.goto("/");

    // SectionDock uses icon-only controls, so explicit accessible names are required.
    await expect(page.getByRole("link", { name: /navigate to projects/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /navigate to experience/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /navigate to skills/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /navigate to certificates/i })).toBeVisible();

    const focusedNavLabels: string[] = [];
    const focusedOutlineWidths: number[] = [];

    for (let index = 0; index < 80; index += 1) {
      await page.keyboard.press("Tab");

      const focusedInfo = await page.evaluate(() => {
        const activeElement = document.activeElement as HTMLElement | null;
        if (!activeElement) {
          return null;
        }

        const commandNav = document.querySelector('[data-testid="command-nav"]');
        if (!commandNav || !commandNav.contains(activeElement)) {
          return null;
        }

        const ariaLabel = activeElement.getAttribute("aria-label");
        const label = (ariaLabel || activeElement.textContent || "").trim();
        const style = window.getComputedStyle(activeElement);

        return {
          label,
          outlineWidth: Number.parseFloat(style.outlineWidth || "0"),
        };
      });

      if (!focusedInfo?.label) {
        continue;
      }

      if (focusedNavLabels[focusedNavLabels.length - 1] !== focusedInfo.label) {
        focusedNavLabels.push(focusedInfo.label);
        focusedOutlineWidths.push(focusedInfo.outlineWidth);
      }

      if (focusedNavLabels.length >= 6) {
        break;
      }
    }

    expect(focusedNavLabels.slice(0, 6)).toEqual([
      "en",
      "es",
      "Projects",
      "Experience",
      "Skills",
      "Certificates",
    ]);

    focusedOutlineWidths.slice(0, 6).forEach((outlineWidth) => {
      expect(outlineWidth).toBeGreaterThan(0);
    });
  });
});
