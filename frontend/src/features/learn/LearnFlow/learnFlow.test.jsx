import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LearnFlow from "./LearnFlow.component";
import * as api from "../../../services/api";

// Mock the quiz and progress API functions so the tests do not make real requests.
vi.mock("../../../services/api", () => ({
  startQuiz: vi.fn(),
  submitQuiz: vi.fn(),
  updateLessonProgress: vi.fn(),
}));

// Use a small lesson with one step and one question so the test can focus on the basic learn flow.
const learnData = {
  id: "1.1",
  moduleId: "cashFlow",
  moduleTitle: "Cash Flow",
  title: "What is Cash Flow?",
  learningGoal: "Understand the basics of cash flow.",
  passThreshold: 0.7,
  nextLessonId: null,
  module: {},
  lessonSteps: [
    {
      id: "1.1.1",
      title: "Cash flow basics",
      content: [
        { id: "paragraph-0", type: "paragraph", text: "Cash flow is money moving in and out." },
      ],
    },
  ],
  questions: [
    {
      id: "question-1",
      lessonStepId: "1.1.1",
      prompt: "What does cash flow describe?",
      type: "singleChoice",
      choices: [
        { id: "a", label: "Money moving in and out" },
        { id: "b", label: "A type of bank account" },
      ],
      correctChoiceIds: ["a"],
      explanation: "Cash flow describes money moving in and out.",
    },
  ],
};

describe("learn flow", () => {
  beforeEach(() => {
    // Start each test with no saved lesson state or previous mock calls.
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("advances from lesson content into a quiz and gives immediate answer feedback", async () => {
    const user = userEvent.setup();

    // Render the lesson in read-only mode so this test only focuses on navigation and quiz feedback.
    render(
      <MemoryRouter>
        <LearnFlow learnData={learnData} characterImages={{}} guideImage="guide.png" isReadOnly />
      </MemoryRouter>,
    );

    expect(screen.getByText("Cash flow is money moving in and out.")).toBeInTheDocument();

    // Move from the lesson content into its quick check question.
    await user.click(screen.getByRole("button", { name: "Quick check" }));
    expect(screen.getByText("What does cash flow describe?")).toBeInTheDocument();

    // Choose the correct answer and submit it for immediate feedback.
    await user.click(screen.getByRole("radio", { name: /Money moving in and out/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(/Cash flow describes money moving in and out\./)).toBeInTheDocument();
  });

  it("shows the passed score and registration call-to-action after a preview quiz", async () => {
    const user = userEvent.setup();

    // Render the lesson as a preview so finishing the quiz leads to the registration prompt.
    render(
      <MemoryRouter>
        <LearnFlow learnData={learnData} characterImages={{}} guideImage="guide.png" isReadOnly />
      </MemoryRouter>,
    );

    // Complete the quick check with the correct answer and open the results.
    await user.click(screen.getByRole("button", { name: "Quick check" }));
    await user.click(screen.getByRole("radio", { name: /Money moving in and out/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "View results" }));

    // A passing preview should show the score and encourage the visitor to register.
    expect(screen.getByText(/Score: 100% — Pass/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register to keep learning" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("syncs progress and submits the quiz for an authenticated learner", async () => {
    const user = userEvent.setup();

    // Mock the lesson progress and quiz requests so the test can focus on the full learner flow.
    api.updateLessonProgress.mockResolvedValue({});
    api.startQuiz.mockResolvedValue({ attemptId: "attempt-1" });
    api.submitQuiz.mockResolvedValue({ score: 100, passed: true, missed: [] });

    render(
      <MemoryRouter>
        <LearnFlow
          learnData={learnData}
          characterImages={{}}
          guideImage="guide.png"
          csrfToken="csrf-1"
        />
      </MemoryRouter>,
    );

    // Complete the quick check with the correct answer and open the results.
    await user.click(screen.getByRole("button", { name: "Quick check" }));
    await user.click(screen.getByRole("radio", { name: /Money moving in and out/i }));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(screen.getByRole("button", { name: "View results" }));

    // The learner's lesson progress should be saved before finishing the quiz flow.
    expect(api.updateLessonProgress).toHaveBeenCalledWith({
      moduleId: "cashFlow",
      lessonId: "1.1",
      microLessonId: "1.1.1",
      currentChunkIndex: 0,
      csrfToken: "csrf-1",
    });

    // Starting the quiz should create the attempt used when the answers are submitted.
    expect(api.startQuiz).toHaveBeenCalledWith({
      moduleId: "cashFlow",
      microLessonId: "1.1.1",
      csrfToken: "csrf-1",
    });

    // Submit the selected answer with the attempt ID returned when the quiz started.
    expect(api.submitQuiz).toHaveBeenCalledWith("1.1.1", {
      attemptId: "attempt-1",
      moduleId: "cashFlow",
      answers: { "question-1": ["a"] },
      csrfToken: "csrf-1",
    });

    expect(screen.getByText(/Score: 100% — Pass/)).toBeInTheDocument();
  });
});
