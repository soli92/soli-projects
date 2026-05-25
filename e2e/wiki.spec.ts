import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Wiki", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "/wiki");
  });

  test("wiki index loads and shows pages", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Wiki", exact: true })
    ).toBeVisible();
    await expect(page.locator("a[href*='/wiki/']").first()).toBeVisible();
  });

  test("wiki index lists known source pages", async ({ page }) => {
    const content = await page.textContent("body");
    expect(content).toContain("Soli Agent");
    expect(content).toContain("Soli Prof");
  });

  test("search filters wiki pages", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/cerca|search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("rag");
      await page.waitForTimeout(500);
      const content = await page.textContent("body");
      expect(content?.toLowerCase()).toContain("rag");
    }
  });

  test("navigates to a wiki source page", async ({ page }) => {
    await page.goto("/wiki/sources/soli-agent");
    await expect(
      page.locator("main").getByRole("heading", { name: /soli agent/i }).first()
    ).toBeVisible();
  });

  test("navigates to a wiki concept page", async ({ page }) => {
    await page.goto("/wiki/concepts/rag-pipeline");
    await expect(
      page.locator("main").getByRole("heading", { name: /rag/i }).first()
    ).toBeVisible();
  });

  test("wiki page shows status badge", async ({ page }) => {
    await page.goto("/wiki/sources/soli-agent");
    const content = await page.textContent("body");
    expect(content).toContain("draft");
  });

  test("non-existent wiki page returns 404", async ({ page }) => {
    const response = await page.goto("/wiki/does-not-exist-page");
    expect(response?.status()).toBe(404);
  });
});
