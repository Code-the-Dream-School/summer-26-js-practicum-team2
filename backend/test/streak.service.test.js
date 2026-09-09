const mongoose = require("mongoose");
const User = require("../src/models/User.model");
const { updateUserStreak } = require("../src/services/streak.service");
const { useTestDb } = require("./setup");

useTestDb();

describe("updateUserStreak", () => {
  it("migrates a legacy numeric streak before updating it", async () => {
    const userId = new mongoose.Types.ObjectId();
    await User.collection.insertOne({
      _id: userId,
      name: "Legacy Streak Learner",
      email: "legacy-streak@example.com",
      tos_agreement: true,
      streak: 0,
    });

    const result = await updateUserStreak(userId);
    const storedUser = await User.collection.findOne({ _id: userId });

    expect(result).toEqual({
      streakAwarded: true,
      currentStreak: 1,
      longestStreak: 1,
      activeLearningDays: 1,
    });
    expect(storedUser.streak).toMatchObject({
      current: 1,
      longest: 1,
      active_learning_days: 1,
      last_active_date: expect.any(Date),
    });
  });
});
