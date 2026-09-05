import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import QuizComponent from "./Quiz.component";

const icons = { rightAnswerIcon: "right.svg", wrongAnswerIcon: "wrong.svg" };

// Use one simple question as the base for the quiz behavior tests.
const singleChoiceQuestion = {
  id: "question-1",
  prompt: "What is a budget?",
  type: "singleChoice",
  choices: [
    { id: "a", label: "A plan for your money" },
    { id: "b", label: "A bank account" },
  ],
  correctChoiceIds: ["a"],
  explanation: "A budget is a plan for your money.",
};

describe("QuizComponent", () => {
  it("selects one choice and exposes the question through radio semantics", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <QuizComponent
        question={singleChoiceQuestion}
        questionNumber={1}
        totalQuestions={2}
        selectedChoiceIds={[]}
        onChange={onChange}
        {...icons}
      />,
    );

    // Single-choice questions should be grouped as radio buttons for accessibility.
    expect(screen.getByRole("radiogroup", { name: "What is a budget?" })).toBeInTheDocument();

    // Selecting an answer should send its choice ID back through onChange.
    await user.click(screen.getByRole("radio", { name: /A plan for your money/i }));
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("toggles multiple choices and shows review explanations", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    // Reuse the base question, but change it to a multi-select question with one extra choice.
    const question = {
      ...singleChoiceQuestion,
      type: "multiSelect",
      choices: [...singleChoiceQuestion.choices, { id: "c", label: "Income and expenses" }],
    };

    const { rerender } = render(
      <QuizComponent
        question={question}
        questionNumber={1}
        totalQuestions={1}
        selectedChoiceIds={["a"]}
        onChange={onChange}
        {...icons}
      />,
    );

    // Selecting another checkbox should keep the existing choice and add the new one.
    await user.click(screen.getByRole("checkbox", { name: /Income and expenses/i }));
    expect(onChange).toHaveBeenCalledWith(["a", "c"]);

    // Render the same question in review mode with a correct result and explanation.
    rerender(
      <QuizComponent
        question={question}
        questionNumber={1}
        totalQuestions={1}
        selectedChoiceIds={["a"]}
        reviewAnswer={{ isCorrect: true, explanation: "A budget is a plan for your money." }}
        onChange={onChange}
        reviewMode
        {...icons}
      />,
    );

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText(/A budget is a plan for your money/)).toBeInTheDocument();
  });
});
