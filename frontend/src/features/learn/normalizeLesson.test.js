import { describe, expect, it } from "vitest";
import {
  getResumeIndex,
  normalizeLearnData,
  normalizeQuestion,
  titlesOverlap,
} from "./normalizeLesson";

describe("lesson normalization", () => {
  it("separates lesson content from knowledge checks and derives the next lesson", () => {
    // Use two lessons so the normalizer can also figure out which lesson comes next.
    const moduleData = {
      id: "cashFlow",
      title: "Cash Flow",
      lessons: [{ id: "1.1" }, { id: "1.2" }],
      glossary: [{ id: "budget", term: "Budget", definition: "A spending plan." }],
      worksCited: [{ id: "source", title: "Financial education source" }],
    };

    // Mix regular lesson content with a knowledge check so they can be split into the right places.
    const lessonData = {
      id: "1.1",
      title: "What is a Budget?",
      learningGoal: "Understand budgets.",
      passingScore: 80,
      microLessons: [
        {
          id: "1.1.1",
          title: "Budget basics",
          microLessonContent: [
            { type: "characterIntro", characterId: "abigail", text: "Meet Abigail." },
            { type: "paragraph", text: "A budget is a plan for your money." },
            {
              type: "knowledgeCheck",
              id: "question-1",
              questionType: "multiSelect",
              question: "What belongs in a budget?",
              answerChoices: [
                { key: "a", text: "Income" },
                { key: "b", text: "Expenses" },
              ],
              correctResponse: ["a", "b"],
            },
          ],
        },
      ],
    };

    const normalized = normalizeLearnData({ moduleData, lessonData });

    // Make sure the lesson-level values are converted into the shape the learn flow expects.
    expect(normalized).toMatchObject({
      id: "1.1",
      moduleId: "cashFlow",
      moduleTitle: "Cash Flow",
      passThreshold: 0.8,
      nextLessonId: "1.2",
    });
    expect(normalized.module.glossary).toEqual(moduleData.glossary);
    expect(normalized.module.worksCited).toEqual(moduleData.worksCited);

    // Regular lesson content should stay with the lesson step.
    expect(normalized.lessonSteps[0]).toMatchObject({
      id: "1.1.1",
      characterId: "abigail",
      content: [
        { id: "characterIntro-0", type: "characterIntro" },
        { id: "paragraph-1", type: "paragraph" },
      ],
    });

    // Knowledge checks should be moved into the normalized questions list.
    expect(normalized.questions).toEqual([
      expect.objectContaining({
        id: "question-1",
        lessonStepId: "1.1.1",
        type: "multiSelect",
        correctChoiceIds: ["a", "b"],
        choices: [
          { id: "a", label: "Income" },
          { id: "b", label: "Expenses" },
        ],
      }),
    ]);
  });

  it("normalizes legacy questions and resumes only at a known lesson step", () => {
    // Use the older question shape to make sure it still normalizes correctly.
    const question = normalizeQuestion(
      {
        prompt: "Choose one",
        choices: [{ id: "a", label: "Answer" }],
        correctResponse: "a",
      },
      2,
    );

    expect(question).toMatchObject({
      id: "question-3",
      type: "singleChoice",
      prompt: "Choose one",
      correctChoiceIds: ["a"],
      choices: [{ id: "a", label: "Answer" }],
    });

    // Resume at the saved step when it still exists in the lesson.
    expect(
      getResumeIndex([{ id: "step-1" }, { id: "step-2" }], { currentMicroLessonId: "step-2" }),
    ).toBe(1);

    // Fall back to the first step if the saved progress no longer matches the lesson.
    expect(getResumeIndex([{ id: "step-1" }], { currentMicroLessonId: "stale" })).toBe(0);
  });

  it("detects overlapping lesson titles without matching empty values", () => {
    // Partial title matches should count, but unrelated or empty titles should not.
    expect(titlesOverlap("What is a Budget?", "Budget")).toBe(true);
    expect(titlesOverlap("Cash Flow", "Expenses")).toBe(false);
    expect(titlesOverlap("", "Budget")).toBe(false);
  });
});
