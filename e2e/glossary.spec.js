import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sampleLessonUrl = "/learn/cashFlow/1.1?sample=true";
const moduleData = JSON.parse(
  readFileSync(resolve(process.cwd(), "shared/content/budgeting.json"), "utf8"),
);
const lessonData = moduleData.lessons.find((lesson) => lesson.id === "1.1");

test.beforeEach(async ({ page }) => {
  // Keep these UI checks independent of any stale or locally imported database content.
  await page.route("**/api/v1/lessons/public/cashFlow/1.1", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ moduleData, lessonData }),
    }),
  );
});

test("learners can view glossary resources without changing their lesson state", async ({
  page,
}) => {
  const progressWrites = [];
  page.on("request", (request) => {
    if (
      request.method() === "PATCH" &&
      request.url().includes("/api/v1/lessons/progress")
    ) {
      progressWrites.push(request);
    }
  });

  await page.goto(sampleLessonUrl);

  const lesson = page.locator("#main-content");
  await expect(lesson.getByText("This is a sample of a lesson.")).toBeVisible();
  const lessonState = await lesson.innerText();
  const opener = page.getByRole("button", {
    name: "Open glossary and references",
  });

  await opener.click();

  const dialog = page.getByRole("dialog", { name: "Glossary and References" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Budget", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();

  await dialog.getByRole("button", { name: "Works Cited" }).click();
  await expect(
    dialog.getByText("Youth Financial Education Glossary", { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Glossary" }).click();

  await page.keyboard.press("Escape");

  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await lesson.innerText()).toBe(lessonState);
  expect(progressWrites).toHaveLength(0);
});

test("the glossary dialog fits a mobile lesson viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(sampleLessonUrl);

  await page
    .getByRole("button", { name: "Open glossary and references" })
    .click();

  const dialog = page.getByRole("dialog", { name: "Glossary and References" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("textbox", { name: "Search glossary terms" }),
  ).toBeVisible();

  const bounds = await dialog.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
});
