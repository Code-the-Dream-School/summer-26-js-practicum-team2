const { describe, it, expect, beforeEach } = require("@jest/globals");
const QuizAttempt = require("../src/models/QuizAttempt.model");
const UserProgress = require("../src/models/UserProgress.model");
const { submitQuiz } = require("../src/controllers/quiz.controller");
const XpEvent = require("../src/models/XpEvent.model");

jest.mock("../src/models/QuizAttempt.model");
jest.mock("../src/models/UserProgress.model");
jest.mock("../src/models/XpEvent.model");
jest.mock("../src/services/streak.service", () => ({
  updateUserStreak: jest.fn().mockResolvedValue(),
}));

describe("quiz XP awards", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        id: "user123",
      },
      params: {
        id: "1.2.4",
      },
      body: {
        attemptId: "attempt123",
        moduleId: "cashFlow",
        //Question 4 should be answer b, so this would be a 75% score
        answers: {
          "1.2.4-q1": "b",
          "1.2.4-q2": "b",
          "1.2.4-q3": "a",
          "1.2.4-q4": "c",
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("awards lesson completion XP when final micro lesson completes the lesson", async () => {
    const attempt = {
      attempt_number: 1,
      submitted_at: null,
      save: jest.fn(),
    };

    QuizAttempt.findOne
      .mockResolvedValueOnce(attempt) //current attempt
      .mockResolvedValueOnce(null) //previousPass
      .mockResolvedValueOnce(null); //previousPerfect

    UserProgress.findOne.mockResolvedValue({
      completed_micro_lessons: [],
    });

    UserProgress.findOneAndUpdate.mockResolvedValue({
      completed_micro_lessons: ["1.2.1", "1.2.2", "1.2.3", "1.2.4"],
      completed_lessons: [],
    });

    await submitQuiz(req, res, next);

    expect(UserProgress.findOneAndUpdate).toHaveBeenCalledTimes(2);

    const lessonUpdateCall = UserProgress.findOneAndUpdate.mock.calls[1][1];

    expect(lessonUpdateCall.$inc.xp).toBe(20);

    expect(lessonUpdateCall.$addToSet.completed_lessons).toBe("1.2");

    expect(XpEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "lesson_complete",
        amount: 20,
      }),
    );
  });

  it("awards quiz pass XP on first successful pass", async () => {
    const attempt = {
      attempt_number: 1,
      submitted_at: null,
      save: jest.fn(),
    };

    QuizAttempt.findOne
      .mockResolvedValueOnce(attempt) //current attempt
      .mockResolvedValueOnce(null) //previousPass
      .mockResolvedValueOnce(null); //previousPerfect

    UserProgress.findOneAndUpdate.mockResolvedValue({
      completed_micro_lessons: [],
      completed_lessons: [],
    });

    await submitQuiz(req, res, next);

    const updateCall = UserProgress.findOneAndUpdate.mock.calls[0][1];

    expect(updateCall.$inc.xp).toBe(10);

    expect(XpEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "quiz_pass",
        amount: 10,
      }),
    );
  });

  it("does not award XP on second successful pass", async () => {
    const attempt = {
      attempt_number: 2,
      submitted_at: null,
      save: jest.fn(),
    };

    QuizAttempt.findOne
      .mockResolvedValueOnce(attempt) //current attempt
      .mockResolvedValueOnce({ passed: true }) //previousPass
      .mockResolvedValueOnce(null); //previousPerfect

    UserProgress.findOneAndUpdate.mockResolvedValue({
      completed_micro_lessons: [],
      completed_lessons: [],
    });

    await submitQuiz(req, res, next);

    const updateCall = UserProgress.findOneAndUpdate.mock.calls[0][1];

    expect(updateCall.$inc?.xp ?? 0).toBe(0);

    expect(XpEvent.create).not.toHaveBeenCalled();
  });

  it("awards only perfect score XP when the user previously passed but has never earned a perfect score", async () => {
    //Perfect score answers for quiz 1.2.4
    req.body.answers = {
      "1.2.4-q1": "b",
      "1.2.4-q2": "b",
      "1.2.4-q3": "a",
      "1.2.4-q4": "b",
    };

    const attempt = {
      attempt_number: 3,
      submitted_at: null,
      save: jest.fn(),
    };

    QuizAttempt.findOne
      .mockResolvedValueOnce(attempt) //current attempt
      .mockResolvedValueOnce({ passed: true }) //previousPass
      .mockResolvedValueOnce(null); //previousPerfect

    UserProgress.findOneAndUpdate.mockResolvedValue({
      completed_micro_lessons: [],
      completed_lessons: [],
    });

    await submitQuiz(req, res, next);

    const updateCall = UserProgress.findOneAndUpdate.mock.calls[0][1];

    expect(updateCall.$inc?.xp).toBe(5);

    expect(XpEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "quiz_perfect",
        amount: 5,
      }),
    );
  });

  it("does not award perfect score xp twice", async () => {
    //Perfect score answers for quiz 1.2.4
    req.body.answers = {
      "1.2.4-q1": "b",
      "1.2.4-q2": "b",
      "1.2.4-q3": "a",
      "1.2.4-q4": "b",
    };

    const attempt = {
      attempt_number: 4,
      submitted_at: null,
      save: jest.fn(),
    };

    QuizAttempt.findOne
      .mockResolvedValueOnce(attempt) //current attempt
      .mockResolvedValueOnce({ passed: true }) //previousPass
      .mockResolvedValueOnce({ score: 100 }); //previousPerfect

    UserProgress.findOneAndUpdate.mockResolvedValue({
      completed_micro_lessons: [],
      completed_lessons: [],
    });

    await submitQuiz(req, res, next);

    const updateCall = UserProgress.findOneAndUpdate.mock.calls[0][1];

    expect(updateCall.$inc?.xp ?? 0).toBe(0);

    expect(XpEvent.create).not.toHaveBeenCalled();
  });
});
