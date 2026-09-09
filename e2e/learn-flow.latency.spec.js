import { expect, test } from "./fixtures/network.js";
import {
  answerQuiz,
  expectNoQuizCompletionError,
  moduleId,
  prepareCurriculumSession,
} from "./fixtures/learnSession.js";

// Long enough that a user can realistically double-click or navigate away while a learn-flow request is still in flight.
const SLOW = 1500;

test.describe("learn flow under slow API responses", () => {
  test("renders lesson content once the slow lesson request resolves", async ({
    page,
  }) => {
    const state = await prepareCurriculumSession(page, {
      lessonDetail: SLOW,
      onboarding: SLOW / 2,
      profile: SLOW / 2,
    });

    await page.goto(`/learn/${moduleId}/1.1`);

    // The learner must never be shown an empty or error shell while the
    // lesson request is still pending.
    await expect(page.getByText(/failed|error|not found/i)).toHaveCount(0);

    await expect(
      page.getByRole("heading", { name: "Lesson 1.1" }),
    ).toBeVisible();
    expect(state.lessonDetailRequests).toEqual(["1.1"]);
  });

  test("does not double-submit a knowledge check when the answer is clicked twice", async ({
    page,
  }) => {
    await prepareCurriculumSession(page, { quizCheck: SLOW, quizStart: SLOW });

    const checkRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/check")) checkRequests.push(request.url());
    });

    await page.goto(`/learn/${moduleId}/1.1`);
    await page.getByRole("button", { name: "Quick check" }).click();

    await page.getByRole("radio", { name: "Correct answer" }).click();
    // Impatient learners double-click while the first request is still pending.
    await page.getByRole("button", { name: "Check answer" }).dblclick();

    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
    expect(checkRequests).toHaveLength(1);
  });

  test("does not double-submit a quiz when results are requested twice", async ({
    page,
  }) => {
    const state = await prepareCurriculumSession(page, { quizSubmit: SLOW });

    await page.goto(`/learn/${moduleId}/1.1`);
    await page.getByRole("button", { name: "Quick check" }).click();

    // "View results" only appears on the last question of the last quiz step.
    await answerQuiz(
      page,
      ["Correct answer", "Correct answer", "Correct answer"],
      false,
    );

    await page.getByRole("button", { name: "Quick check" }).click();
    await answerQuiz(page, ["Correct answer", "Correct answer"], false);

    await page.getByRole("radio", { name: "Correct answer" }).click();
    await page.getByRole("button", { name: "Check answer" }).click();

    const viewResults = page.getByRole("button", { name: "View results" });
    await viewResults.dblclick();

    await expect(page.getByText(/Score: 100%/)).toBeVisible();
    expect(
      state.submittedQuizzes.filter((quiz) => quiz.microLessonId === "1.1.4"),
    ).toHaveLength(1);
  });

  test("does not double-complete a lesson when finish is clicked twice", async ({
    page,
  }) => {
    const state = await prepareCurriculumSession(page, {
      lessonComplete: SLOW,
      microLessonComplete: SLOW,
    });

    await page.goto(`/learn/${moduleId}/1.2`);
    await expect(
      page.getByRole("heading", { name: "Lesson 1.2" }),
    ).toBeVisible();

    const finish = page.getByRole("button", { name: "Finish lesson" });
    await finish.dblclick();

    await expect(page.getByRole("link", { name: "Continue" })).toBeVisible();
    await expectNoQuizCompletionError(page);

    expect(
      state.completedLessons.filter((entry) => entry.lessonId === "1.2"),
    ).toHaveLength(1);
    expect(
      state.completedMicroLessons.filter(
        (entry) => entry.microLessonId === "1.2.1",
      ),
    ).toHaveLength(1);
  });

  test("shows the latest lesson when the learner navigates before the previous request resolves", async ({
    page,
  }) => {
    const state = await prepareCurriculumSession(page, { lessonDetail: SLOW });

    await page.goto(`/learn/${moduleId}/1.2`);
    await expect(
      page.getByRole("heading", { name: "Lesson 1.2" }),
    ).toBeVisible();

    // Jump to a different lesson and immediately jump again so the first
    // response arrives after the second navigation has already started.
    await page.goto(`/learn/${moduleId}/1.3`, { waitUntil: "commit" });
    await page.goto(`/learn/${moduleId}/1.4`, { waitUntil: "commit" });

    // The stale 1.3 response must not overwrite the lesson the learner is on.
    await expect(
      page.getByRole("heading", { name: "Lesson 1.4" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lesson 1.3" })).toHaveCount(
      0,
    );
    expect(state.lessonDetailRequests.at(-1)).toBe("1.4");
  });
});
