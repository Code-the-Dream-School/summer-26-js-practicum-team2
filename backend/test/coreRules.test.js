const { describe, it, expect } = require("@jest/globals");
const {
  calculateXpDelta,
  calculateStreakStatus,
  calculateLearningDays,
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
        isFirstPerfect: true,
        isPerfect: true,
        currentTotal: 495,
      }),
    ).toEqual({
      amount: 5,
      capped: false,
      remaining: 0,
    });
  });

  it("requires a perfect score", () => {
    expect(
      calculateXpDelta({
        eventType: "quiz_perfect",
        score: 80,
        isPerfect: false,
        isFirstPerfect: true,
      }),
    ).toEqual({
      amount: 0,
      capped: false,
      remaining: 500,
    });
  });

  it("clamps rewards when approaching the daily cap", () => {
    expect(
      calculateXpDelta({
        eventType: "lesson_complete",
        isFirstTime: true,
        currentTotal: 495,
      }),
    ).toEqual({
      amount: 5,
      capped: true,
      remaining: 0,
    });
  });

  it("awards onboarding XP only once", () => {
    expect(
      calculateXpDelta({
        eventType: "onboarding_complete",
        isFirstTime: true,
      }),
    ).toEqual({
      amount: 50,
      capped: false,
      remaining: 450,
    });

    expect(
      calculateXpDelta({
        eventType: "onboarding_complete",
        isFirstTime: false,
      }),
    ).toEqual({
      amount: 0,
      capped: false,
      remaining: 500,
    });
  });

  it("requires first perfect score", () => {
    expect(
      calculateXpDelta({
        eventType: "quiz_perfect",
        score: 100,
        isPerfect: true,
        isFirstPerfect: false,
      }),
    ).toEqual({
      amount: 0,
      capped: false,
      remaining: 500,
    });
  });

  it("does not award lesson XP twice", () => {
    expect(
      calculateXpDelta({
        eventType: "lesson_complete",
        isFirstTime: false,
      }),
    ).toEqual({
      amount: 0,
      capped: false,
      remaining: 500,
    });
  });

  it("tracks streaks", () => {
    const today = new Date("2026-08-19T12:00:00Z");

    expect(
      calculateStreakStatus({
        activeDates: ["2026-08-17", "2026-08-18", "2026-08-19"],
        today,
      }),
    ).toMatchObject({
      currentStreak: 3,
      longestStreak: 3,
    });

    expect(
      calculateStreakStatus({
        activeDates: ["2026-08-17", "2026-08-18"],
        today: new Date("2026-08-20T12:00:00Z"),
      }),
    ).toMatchObject({
      currentStreak: 0,
      longestStreak: 2,
    });

    expect(
      calculateStreakStatus({
        activeDates: ["2026-08-17"],
        today: new Date("2026-08-20T12:00:00Z"),
        freezeBalance: 1,
      }),
    ).toMatchObject({ currentStreak: 0 });
  });

  it("calculates streaks using local timezone", () => {
    const result = calculateStreakStatus({
      activeDates: ["2026-08-25T03:00:00Z"],
      today: new Date("2026-08-25T03:00:00Z"),
      timezone: "America/New_York",
    });

    expect(result.currentStreak).toBe(1);
  });

  it("counts unique learning days", () => {
    expect(
      calculateLearningDays([
        "2026-08-20T09:00:00Z",
        "2026-08-20T18:00:00Z",
        "2026-08-21T12:00:00Z",
      ]),
    ).toBe(2);
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
