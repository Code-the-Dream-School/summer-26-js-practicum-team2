import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import LearnFlow from "./LearnFlow.component";

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
    // Clear any saved lesson state so each test starts from the beginning.
    window.localStorage.clear();
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
});