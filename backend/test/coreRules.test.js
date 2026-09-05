const { describe, it, expect } = require("@jest/globals");
const {
  calculateXpDelta,
  calculateStreakStatus,
  isLessonUnlocked,
} = require("../src/utils/coreRules");

describe("core rules", () => {
  it("applies XP amounts and caps daily totals", () => {
    expect(calculateXpDelta({ eventType: "lesson_complete", isFirstTime: true })).toEqual({
      amount: 20,
      capped: false,
      remaining: 480,
    });

    expect(
      calculateXpDelta({
        eventType: "quiz_pass",
        score: 85,
        isFirstPass: true,
        currentTotal: 490,
      }),
    ).toEqual({
      amount: 10,
      capped: false,
      remaining: 0,
    });

    expect(
      calculateXpDelta({
        eventType: "quiz_perfect",
        score: 100,
        isPerfect: true,
        currentTotal: 495,
      }),
    ).toEqual({
      amount: 5,
      capped: false,
      remaining: 0,
    });

    expect(
      calculateXpDelta({
        eventType: "daily_goal_met",
        currentTotal: 499,
      }),
    ).toEqual({
      amount: 1,
      capped: true,
      remaining: 0,
    });
  });

  it("tracks streaks and freeze consumption for missed days", () => {
    const today = new Date("2026-08-19T12:00:00Z");

    expect(
      calculateStreakStatus({
        activeDates: ["2026-08-17", "2026-08-18", "2026-08-19"],
        today,
      }),
    ).toMatchObject({
      currentStreak: 3,
      longestStreak: 3,
      freezeUsed: false,
      freezesRemaining: 0,
    });

    expect(
      calculateStreakStatus({
        activeDates: ["2026-08-17", "2026-08-18"],
        today: new Date("2026-08-20T12:00:00Z"),
        freezeBalance: 1,
      }),
    ).toMatchObject({
      currentStreak: 2,
      freezeUsed: true,
      freezesRemaining: 0,
    });
  });

  it("locks lessons until the previous lesson is complete", () => {
    expect(
      isLessonUnlocked({
        lessonId: "1.1.1",
        lessonSequence: ["1.1.1", "1.1.2", "1.1.3"],
        completedLessons: [],
      }),
    ).toBe(true);

    expect(
      isLessonUnlocked({
        lessonId: "1.1.2",
        lessonSequence: ["1.1.1", "1.1.2", "1.1.3"],
        completedLessons: ["1.1.1"],
      }),
    ).toBe(true);

    expect(
      isLessonUnlocked({
        lessonId: "1.1.3",
        lessonSequence: ["1.1.1", "1.1.2", "1.1.3"],
        completedLessons: ["1.1.1"],
      }),
    ).toBe(false);
  });
});
