import { test, expect } from "@playwright/test";
import { login, TEST_PASSWORD } from "./helpers";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to /login", async ({ page }) => {
    await page.goto("/wiki");
    await expect(page).toHaveURL(/\/login\?next=%2Fwiki/);
  });

  test("redirects to /login with ?next preserving target path", async ({
    page,
  }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login\?next=%2Ftasks/);
  });

  test("shows login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Accedi")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entra" })).toBeVisible();
  });

  test("shows error on wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Entra" }).click();
    await expect(page.getByText("Password errata")).toBeVisible();
  });

  test("logs in with correct password and redirects to target", async ({
    page,
  }) => {
    await page.goto("/login?next=/wiki");
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entra" }).click();
    await page.waitForURL("/wiki", { timeout: 15_000 });
    await expect(page).toHaveURL("/wiki");
  });

  test("logs in and redirects to /tasks via ?next", async ({ page }) => {
    await page.goto("/login?next=/tasks");
    await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Entra" }).click();
    await page.waitForURL("/tasks", { timeout: 15_000 });
    await expect(page).toHaveURL("/tasks");
  });

  test("logout clears session and redirects to /login", async ({ page }) => {
    await login(page, "/wiki");
    await page.getByRole("button", { name: /esci/i }).click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/wiki");
    await expect(page).toHaveURL(/\/login/);
  });
});
