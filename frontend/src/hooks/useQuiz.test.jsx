import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as api from "../services/api";
import { useQuiz } from "./useQuiz";

vi.mock("../services/api", () => ({
  checkQuizAnswer: vi.fn(),
  startQuiz: vi.fn(),
  submitQuiz: vi.fn(),
}));

const questions = [
  {
    id: "question-1",
    lessonStepId: "1.1.1",
    choices: [{ id: "a", label: "Money moving in and out" }],
  },
];

describe("useQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resolves a submitted payload without updating quiz state after unmount", async () => {
    const submission = { score: 100, passed: true, missed: [] };
    let resolveSubmission;
    api.submitQuiz.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmission = resolve;
        }),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result, unmount } = renderHook(() =>
      useQuiz({ questions, moduleId: "cashFlow", csrfToken: "csrf-1" }),
    );

    act(() => {
      result.current.selectChoice("question-1", ["a"]);
    });

    let submissionPromise;
    act(() => {
      submissionPromise = result.current.submit("1.1.1", questions);
    });

    expect(result.current.status).toBe("submitting");

    unmount();

    await act(async () => {
      resolveSubmission(submission);
      await expect(submissionPromise).resolves.toBe(submission);
    });

    expect(api.submitQuiz).toHaveBeenCalledWith("1.1.1", {
      attemptId: null,
      moduleId: "cashFlow",
      answers: { "question-1": ["a"] },
      csrfToken: "csrf-1",
    });
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
