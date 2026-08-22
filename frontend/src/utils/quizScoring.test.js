import { describe, expect, it } from "vitest";
import { aggregateLessonScore } from "./quizScoring";

describe("aggregateLessonScore", () => {
  it("weights by question count instead of averaging per-quiz percentages", () => {
    const submissions = [
      { totalQuestions: 6, missed: ["1.1.2-q2"] }, // 5/6 correct
      { totalQuestions: 11, missed: [] }, // 11/11 correct
    ];

    const result = aggregateLessonScore(submissions, 0.7);

    // 16 correct / 17 total = 94%, not the weighted average of ~92%
    expect(result.percentage).toBe(94);
    expect(result.passed).toBe(true);
  });

  it("passes on the combined score even if one sub-quiz individually scored below threshold", () => {
    const submissions = [
      { totalQuestions: 3, missed: ["q1"] }, // 2/3 = 67%, would fail alone
      { totalQuestions: 3, missed: [] }, // 3/3 = 100%
    ];

    const result = aggregateLessonScore(submissions, 0.7);

    // 5/6 = 83%, above the 70% threshold overall
    expect(result.percentage).toBe(83);
    expect(result.passed).toBe(true);
  });

  it("fails when the combined score is below the pass threshold", () => {
    const submissions = [{ totalQuestions: 4, missed: ["q1", "q2"] }]; // 2/4 = 50%

    const result = aggregateLessonScore(submissions, 0.7);

    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(false);
  });

  it("returns a zero, unpassed result when there are no submissions", () => {
    const result = aggregateLessonScore([], 0.7);

    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
  });
});
