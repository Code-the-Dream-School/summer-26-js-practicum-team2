import { test, expect } from "@playwright/test";

test("signed-out learners are redirected from protected routes", async ({ page }) => {
  // Start on a protected page without an authenticated session.
  await page.goto("/dashboard");

  // Signed-out learners should be sent to login with the original route saved as next.
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("learners can open the mobile menu and navigate with the keyboard", async ({ page }) => {
  // Use a mobile-sized viewport so the responsive navigation menu is shown.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // Keyboard users should be able to open the mobile menu with Enter.
  const toggle = page.getByRole("button", { name: "Toggle navigation menu" });
  await toggle.focus();
  await page.keyboard.press("Enter");

  await expect(toggle).toHaveAttribute("aria-expanded", "true");

  // Move focus to the mobile login link and activate it with the keyboard.
  const loginLink = page.getByRole("link", { name: "Login" }).last();
  await expect(loginLink).toBeVisible();
  await loginLink.focus();
  await page.keyboard.press("Enter");

  // Navigation should succeed and the mobile menu should close again.
  await expect(page).toHaveURL(/\/login$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});