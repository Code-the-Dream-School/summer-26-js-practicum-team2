import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import LearnFlow from "./LearnFlow.component";

// Keep the progress requests mocked so these tests can focus on LearnFlow behavior.
const completeLessonMock = vi.fn(() => Promise.resolve({}));
const updateLessonProgressMock = vi.fn(() => Promise.resolve({}));
const restartLessonProgressMock = vi.fn(() => Promise.resolve({}));

// Mock the quiz hook since these regression tests do not need to run through a real quiz.
vi.mock("../../../hooks/useQuiz", () => ({
  useQuiz: () => ({
    questionIndex: 0,
    currentQuestion: null,
    selectedChoiceIds: [],
    review: false,
    status: "idle",
    answers: {},
    errorMessage: "",
    begin: vi.fn(),
    goToNextQuestion: vi.fn(),
    checkAnswer: vi.fn(),
    submit: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock("../../../utils/quizFeedbackPreference", () => ({
  getQuizFeedbackPreference: () => "immediate",
}));

vi.mock("../../../utils/quizScoring", () => ({
  aggregateLessonScore: () => ({ percentage: 100, passed: true }),
}));

// Route progress calls through shared mocks so we can check what LearnFlow sends to the API.
vi.mock("../../../services/api", () => ({
  completeMicroLesson: vi.fn().mockResolvedValue({}),
  completeLesson: (...args) => completeLessonMock(...args),
  updateLessonProgress: (...args) => updateLessonProgressMock(...args),
  restartLessonProgress: (...args) => restartLessonProgressMock(...args),
}));

vi.mock("../Quiz/encouragingCopy", () => ({
  getQuizCompletionPhrase: () => "Nice work",
  getQuizCompletionWord: () => "Great",
  getAllCaughtUpPhrase: () => "All caught up",
}));

// Replace child components with simple versions so these tests stay focused on LearnFlow.
vi.mock("../Quiz/Quiz.component", () => ({
  default: () => <div>Quiz</div>,
}));

vi.mock("../Quiz/QuizReview/QuizReview.component", () => ({
  default: () => <div>Quiz Review</div>,
}));

vi.mock("../../../shared/Button/Button.component", () => ({
  default: ({ children, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("../../../shared/Card/Card.component", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../../../shared/ProgressBar/ProgressBar.component", () => ({
  default: () => <div>Progress Bar</div>,
}));

vi.mock("../Lesson/Lesson.component", () => ({
  default: ({ title }) => <div>{title || "Lesson Body"}</div>,
}));

// Use a small two-step lesson so resume and restart behavior is easy to control.
const baseLearnData = {
  id: "1.1",
  moduleId: "cashFlow",
  moduleTitle: "Budgeting and Cash Flow Basics",
  title: "What is Cash Flow and a Budget?",
  module: "cashFlow",
  learningGoal: "Understand budgeting basics",
  lessonSteps: [
    {
      id: "1.1.1",
      title: "Step One",
      content: [{ type: "paragraph", text: "One" }],
    },
    {
      id: "1.1.2",
      title: "Step Two",
      content: [{ type: "paragraph", text: "Two" }],
    },
  ],
  questions: [],
  passThreshold: 70,
  nextLessonId: "1.2",
};

// Keep the common LearnFlow setup in one place so each test only needs to pass what changes.
function renderLearnFlow(props = {}) {
  return render(
    <LearnFlow
      learnData={baseLearnData}
      characterImages={{ beaver: "/beaver.png" }}
      guideImage="/guide.png"
      csrfToken="csrf-token"
      {...props}
    />,
  );
}

describe("LearnFlow regressions", () => {
  beforeEach(() => {
    // Clear previous progress calls so each test starts with fresh mocks.
    completeLessonMock.mockClear();
    updateLessonProgressMock.mockClear();
    restartLessonProgressMock.mockClear();
  });

  it("shows resume banner only when resuming from saved progress on mount", () => {
    // Start the learner on the second step to represent a resumed lesson.
    renderLearnFlow({
      savedProgress: {
        currentLessonId: "1.1",
        currentMicroLessonId: "1.1.2",
        currentChunkIndex: 0,
      },
    });

    expect(screen.getByText('Welcome Back! Resuming "Step Two"')).toBeInTheDocument();
  });

  it("does not show resume banner on a fresh start", () => {
    // With no saved progress, the lesson should behave like a new visit.
    renderLearnFlow({ savedProgress: null });

    expect(screen.queryByText(/Welcome Back! Resuming/)).not.toBeInTheDocument();
  });

  it("renders Start Over when a resumed session is away from lesson start", () => {
    // Resume on the second step so the learner has something to restart.
    renderLearnFlow({
      savedProgress: {
        currentLessonId: "1.1",
        currentMicroLessonId: "1.1.2",
        currentChunkIndex: 0,
      },
    });

    expect(screen.getByRole("button", { name: "Start Over" })).toBeInTheDocument();
  });

  it("calls restart endpoint with moduleId and csrfToken when Start Over is clicked", async () => {
    const user = userEvent.setup();

    renderLearnFlow({
      savedProgress: {
        currentLessonId: "1.1",
        currentMicroLessonId: "1.1.2",
        currentChunkIndex: 0,
      },
    });

    // Restart the resumed lesson and make sure the expected values are sent to the API.
    await user.click(screen.getByRole("button", { name: "Start Over" }));

    await waitFor(() => {
      expect(restartLessonProgressMock).toHaveBeenCalledWith({
        moduleId: "cashFlow",
        csrfToken: "csrf-token",
      });
    });
  });

  it("syncs lesson progress with lesson, micro-lesson, and chunk", async () => {
    // Resume from a saved step so LearnFlow has progress that needs to be synced.
    renderLearnFlow({
      savedProgress: {
        currentLessonId: "1.1",
        currentMicroLessonId: "1.1.2",
        currentChunkIndex: 0,
      },
    });

    // The saved position should be synced with all of the values needed by the backend.
    await waitFor(() => {
      expect(updateLessonProgressMock).toHaveBeenCalledWith({
        moduleId: "cashFlow",
        lessonId: "1.1",
        microLessonId: "1.1.2",
        currentChunkIndex: 0,
        csrfToken: "csrf-token",
      });
    });
  });

  it("persists a finished lesson so dashboard progress can refresh", async () => {
    const user = userEvent.setup();
    renderLearnFlow();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Finish lesson" }));

    await waitFor(() => {
      expect(completeLessonMock).toHaveBeenCalledWith({
        moduleId: "cashFlow",
        lessonId: "1.1",
        csrfToken: "csrf-token",
      });
    });
  });
});
