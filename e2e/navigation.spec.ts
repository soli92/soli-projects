import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "/wiki");
  });

  test("header has logo link to dashboard", async ({ page }) => {
    const logoLink = page.locator("header a[href='/']").first();
    await expect(logoLink).toBeVisible();
  });

  test("header shows nav links on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/wiki");

    await expect(
      page.locator("header").getByRole("link", { name: /wiki/i })
    ).toBeVisible();
    await expect(
      page.locator("header").getByRole("link", { name: /task/i })
    ).toBeVisible();
  });

  test("clicking Wiki nav link navigates to /wiki", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.locator("header").getByRole("link", { name: /wiki/i }).click();
    await expect(page).toHaveURL("/wiki");
  });
});
