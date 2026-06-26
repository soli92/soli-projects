import { type Page } from "@playwright/test";

export const TEST_PASSWORD = "e2e-test-password";

export async function login(page: Page, target = "/wiki") {
  await page.goto(`/login?next=${encodeURIComponent(target)}`);
  await page.getByPlaceholder("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Entra" }).click();
  await page.waitForURL(target, { timeout: 15_000 });
}
