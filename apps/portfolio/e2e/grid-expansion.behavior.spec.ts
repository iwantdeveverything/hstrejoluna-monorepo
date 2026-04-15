import { expect, test } from "@playwright/test";

const getProjectGridColumnCount = async (page: import("@playwright/test").Page) =>
  page.locator("#projects .grid-with-life").evaluate((element) => {
    const columns = getComputedStyle(element).gridTemplateColumns;
    return columns.split(" ").filter(Boolean).length;
  });

test.describe("in-place expansion grids", () => {
  test("projects grid uses three columns on desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only responsive assertion");

    await page.goto("/#projects");
    await expect(page.locator("#projects .grid-with-life")).toBeVisible();

    const columnCount = await getProjectGridColumnCount(page);
    expect(columnCount).toBe(3);
  });

  test("projects grid uses one column on mobile", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("Mobile"), "Mobile-only responsive assertion");

    await page.goto("/#projects");
    await expect(page.locator("#projects .grid-with-life")).toBeVisible();

    const columnCount = await getProjectGridColumnCount(page);
    expect(columnCount).toBe(1);
  });

  test("project selection expands in place and collapses previous selection", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only interaction assertion");

    await page.goto("/#projects");

    const projectButtons = page.locator('button[aria-controls^="project-panel-"]');
    const buttonCount = await projectButtons.count();
    test.skip(buttonCount < 2, "Needs at least two projects for singular expansion verification");

    const first = projectButtons.nth(0);
    const second = projectButtons.nth(1);

    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    const firstPanelId = await first.getAttribute("aria-controls");
    await expect(page.locator(`#${firstPanelId}`)).toBeVisible();

    await second.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  });

  test("experience selection keeps singular expansion behavior", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name.includes("Mobile"), "Desktop-only interaction assertion");

    await page.goto("/#experience");

    const experienceButtons = page.locator('button[aria-controls^="details-"]');
    const buttonCount = await experienceButtons.count();
    test.skip(buttonCount < 2, "Needs at least two experiences for singular expansion verification");

    const first = experienceButtons.nth(0);
    const second = experienceButtons.nth(1);

    await first.click();
    await expect(first).toHaveAttribute("aria-expanded", "true");

    await second.click();
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(second).toHaveAttribute("aria-expanded", "true");
  });
});
