const { describe, it, expect, beforeEach } = require("@jest/globals");
const { User } = require("../src/models/User.model");
const UserProgress = require("../src/models/UserProgress.model");
const { updateOnboardingProgress } = require("../src/controllers/onboarding.controller");
const XpEvent = require("../src/models/XpEvent.model");

jest.mock("../src/models/User.model");
jest.mock("../src/models/UserProgress.model");
jest.mock("../src/models/XpEvent.model");

jest.mock("../src/validation/userValidation.js", () => ({
  updateOnboardingProgressSchema: {
    validate: jest.fn().mockReturnValue({
      value: {
        markAllComplete: true,
      },
    }),
  },
}));

describe("onboarding xp awarded", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: {
        id: "user123",
      },
      body: {
        markAllComplete: true,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  it("awards 50 XP when onboarding is completed the first time", async () => {
    const user = {
      onboarding: {
        is_completed: false,
        xp_awarded: false,
        tours: {
          dashboardPage: { dismissed: true },
          learningPath: { dismissed: true },
          lessonPage: { dismissed: true },
          profilePage: { dismissed: true },
        },
      },

      markModified: jest.fn(),
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(user);

    UserProgress.findOneAndUpdate.mockResolvedValue({
      xp: 50,
    });

    await updateOnboardingProgress(req, res, next);

    expect(UserProgress.findOneAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $inc: { xp: 50 },
      }),
      expect.anything(),
    );

    expect(user.onboarding.is_completed).toBe(true);
    expect(user.onboarding.xp_awarded).toBe(true);
    expect(user.save).toHaveBeenCalled();

    expect(XpEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "onboarding_complete",
        amount: 50,
      }),
    );
  });

  it("does not award onboarding XP if already awarded", async () => {
    const user = {
      onboarding: {
        is_completed: false,
        xp_awarded: true,
        tours: {
          dashboardPage: { dismissed: true },
          learningPath: { dismissed: true },
          lessonPage: { dismissed: true },
          profilePage: { dismissed: true },
        },
      },

      markModified: jest.fn(),
      save: jest.fn(),
    };

    User.findById.mockResolvedValue(user);

    await updateOnboardingProgress(req, res, next);

    expect(UserProgress.findOneAndUpdate).not.toHaveBeenCalled();

    expect(XpEvent.create).not.toHaveBeenCalled();
  });
});
