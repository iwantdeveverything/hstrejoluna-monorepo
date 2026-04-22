import { expect, test } from "@playwright/test";

test.describe("portfolio navigation behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("consent_preferences", JSON.stringify({ analytics: true, timestamp: new Date().toISOString() }));
    });
  });
  test("scrolling updates active section marker without clicking navigation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only flow");

    await page.goto("/");

    await page.evaluate(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "auto", block: "start" });
    });

    await expect
      .poll(() =>
        page
          .getByRole("link", { name: /^projects$/i })
          .first()
          .getAttribute("aria-current")
      )
      .toBe("location");
  });

  test("desktop layout hides mobile menu toggle", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only flow");

    await page.goto("/");
    await expect(page.getByRole("button", { name: /open navigation menu/i })).toHaveCount(0);
  });

  test("desktop navigation activates certificates and auto-hides on downward scroll", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only flow");

    await page.goto("/");

    const commandNav = page.getByTestId("command-nav");
    const certificatesDockLink = page.getByRole("link", {
      name: /navigate to certificates/i,
    });
    await expect(certificatesDockLink).toBeVisible();

    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    await expect
      .poll(async () => commandNav.getAttribute("data-hidden"))
      .toBe("false");

    await certificatesDockLink.click();

    const certificatesNavLink = page.getByRole("link", { name: /^certificates$/i }).first();
    await expect(certificatesNavLink).toHaveAttribute("aria-current", "location");
    await expect
      .poll(async () => commandNav.getAttribute("data-hidden"))
      .toBe("true");

    await page.evaluate(() => {
      window.scrollTo({ top: 2400, behavior: "auto" });
    });

    await page.evaluate(() => {
      window.scrollTo({ top: 120, behavior: "auto" });
    });
    await expect
      .poll(async () => commandNav.getAttribute("data-hidden"))
      .toBe("false");
  });

  test("mobile menu opens and navigates to target section", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("Mobile"), "Mobile-only flow");

    await page.goto("/");

    const openMenuButton = page.getByRole("button", {
      name: /open navigation menu/i,
    });
    await expect(openMenuButton).toBeVisible();
    await openMenuButton.click();

    const mobileNavigation = page.getByRole("navigation", {
      name: /mobile section navigation/i,
    });
    await expect(mobileNavigation).toBeVisible();
    await mobileNavigation.getByRole("link", { name: /certificates/i }).click();

    await expect(mobileNavigation).toHaveCount(0);
    await expect(page).toHaveURL(/#certificates$/);
  });
});
