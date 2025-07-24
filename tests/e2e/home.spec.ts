import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the home page correctly", async ({ page }) => {
    await page.goto("/");

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Create Next App/);

    // Check for the presence of key elements
    await expect(page.getByAltText("Next.js logo")).toBeVisible();
    await expect(page.getByText("Get started by editing")).toBeVisible();
    await expect(page.getByRole("link", { name: /deploy now/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /read our docs/i })
    ).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Test that external links have proper attributes
    const deployLink = page.getByRole("link", { name: /deploy now/i });
    const docsLink = page.getByRole("link", { name: /read our docs/i });

    await expect(deployLink).toHaveAttribute("target", "_blank");
    await expect(docsLink).toHaveAttribute("target", "_blank");

    // Check href attributes
    await expect(deployLink).toHaveAttribute("href", /vercel\.com/);
    await expect(docsLink).toHaveAttribute("href", /nextjs\.org\/docs/);
  });

  test("should be responsive", async ({ page }) => {
    await page.goto("/");

    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator("main")).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByAltText("Next.js logo")).toBeVisible();
  });

  test("should have proper accessibility", async ({ page }) => {
    await page.goto("/");

    // Check for basic accessibility
    const images = page.locator("img");
    for (const img of await images.all()) {
      await expect(img).toHaveAttribute("alt");
    }

    // Check for proper heading structure
    await expect(page.locator("h1, h2, h3")).toHaveCount(0); // This starter template doesn't have headings
  });
});
