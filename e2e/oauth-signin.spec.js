import { expect, test } from "@playwright/test";

test("learners can start Google or GitHub sign-in from the login page", async ({
  page,
}) => {
  await page.route("**/api/v1/auth/providers", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ google: true, github: true }),
    }),
  );
  await page.goto("/login");

  await expect(
    page.getByRole("link", { name: "Continue with Google" }),
  ).toHaveAttribute("href", "/api/v1/auth/google");
  await expect(
    page.getByRole("link", { name: "Continue with GitHub" }),
  ).toHaveAttribute("href", "/api/v1/auth/github");
});

test("learners see a clear message after a failed provider sign-in", async ({
  page,
}) => {
  await page.goto("/login?error=oauth_failed");

  await expect(page.getByRole("alert")).toHaveText(
    "That sign-in attempt didn't work. Please try again.",
  );
});
