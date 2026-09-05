import { describe, expect, it } from "vitest";
import authReducer, {
  actions as authActions,
  initialState as authInitialState,
} from "./auth.reducer";
import quizReducer, {
  actions as quizActions,
  initialState as quizInitialState,
} from "./quiz.reducer";

describe("auth reducer", () => {
  it("hydrates and commits a session, then clears it on logout", () => {
    // Start by restoring a saved session and finishing the hydration state
    const hydrated = authReducer(authInitialState, {
      type: authActions.hydrateComplete,
      user: { id: "user-1" },
      csrfToken: "csrf-1",
    });

    // Replace the hydrated session with newly authenticated user data
    const committed = authReducer(hydrated, {
      type: authActions.commitAuth,
      user: { id: "user-2" },
      csrfToken: "csrf-2",
    });

    // Clearing auth should remove the current user and session token
    const cleared = authReducer(committed, { type: authActions.clearAuth });

    expect(hydrated).toMatchObject({
      user: { id: "user-1" },
      csrfToken: "csrf-1",
      isHydrating: false,
    });
    expect(committed).toMatchObject({
      user: { id: "user-2" },
      csrfToken: "csrf-2",
      isSubmitting: false,
    });
    expect(cleared).toMatchObject({ user: null, csrfToken: null, isSubmitting: false });
  });

  it("tracks request and error states without losing the current session", () => {
    // Start with an existing authenticated session so we can make sure it survives request errors
    const session = { ...authInitialState, user: { id: "user-1" }, csrfToken: "csrf-1" };

    const submitting = authReducer(session, { type: authActions.startRequest });

    // A failed request should store the error without clearing the current user
    const failed = authReducer(submitting, {
      type: authActions.setError,
      errorMessage: "Request failed",
    });

    // Clearing the error should leave the rest of the auth state alone
    const cleared = authReducer(failed, { type: authActions.clearError });

    expect(submitting).toMatchObject({ isSubmitting: true, errorMessage: "" });
    expect(failed).toMatchObject({
      user: session.user,
      csrfToken: "csrf-1",
      isSubmitting: false,
      errorMessage: "Request failed",
    });
    expect(cleared.errorMessage).toBe("");
  });
});

describe("quiz reducer", () => {
  it("starts an attempt, records answers, and preserves reviewed answers", () => {
    // Start a new quiz attempt with no answers selected yet
    const active = quizReducer(quizInitialState, {
      type: quizActions.startAttempt,
      attemptId: "attempt-1",
    });

    const answered = quizReducer(active, {
      type: quizActions.selectChoice,
      questionId: "question-1",
      choiceIds: ["a"],
    });

    // Mark the answer as reviewed so it should no longer be changed
    const reviewed = quizReducer(answered, {
      type: quizActions.revealAnswer,
      questionId: "question-1",
      isCorrect: true,
      explanation: "Correct.",
    });

    // Try changing the answer after review to make sure the original choice is preserved
    const changed = quizReducer(reviewed, {
      type: quizActions.selectChoice,
      questionId: "question-1",
      choiceIds: ["b"],
    });

    expect(active).toMatchObject({ attemptId: "attempt-1", status: "active", answers: {} });
    expect(answered.answers["question-1"]).toEqual(["a"]);
    expect(reviewed.reviews["question-1"]).toEqual({ isCorrect: true, explanation: "Correct." });
    expect(changed.answers["question-1"]).toEqual(["a"]);
  });

  it("moves between questions and records submit success or failure", () => {
    // Move forward and back once to make sure the question index updates correctly
    const next = quizReducer(quizInitialState, { type: quizActions.nextQuestion });
    const previous = quizReducer(next, { type: quizActions.previousQuestion });

    // Walk through the different states the quiz can enter while being submitted
    const submitting = quizReducer(previous, { type: quizActions.submitStart });
    const failed = quizReducer(submitting, {
      type: quizActions.submitFailure,
      errorMessage: "Unable to submit",
    });
    const succeeded = quizReducer(failed, {
      type: quizActions.submitSuccess,
      result: { score: 100, passed: true },
    });

    expect(next.questionIndex).toBe(1);
    expect(previous.questionIndex).toBe(0);
    expect(submitting.status).toBe("submitting");
    expect(failed).toMatchObject({ status: "error", errorMessage: "Unable to submit" });
    expect(succeeded).toMatchObject({ status: "submitted", result: { score: 100, passed: true } });
  });
});
