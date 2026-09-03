const QuizAttempt = require("../models/QuizAttempt.model");
const { calculateStreakStatus } = require("./coreRules");

const getDateKey = (date) => new Date(date).toISOString().slice(0, 10);

async function getLearningMotivation(userId, now = new Date()) {
  const passedAttempts = await QuizAttempt.find({
    user_id: userId,
    passed: true,
    submitted_at: { $ne: null },
  })
    .select("submitted_at")
    .lean();
  const currentDays = calculateStreakStatus({
    activeDates: passedAttempts.map((attempt) => attempt.submitted_at),
    today: now,
  }).currentStreak;
  const todayKey = getDateKey(now);
  const completedToday = passedAttempts.filter(
    (attempt) => getDateKey(attempt.submitted_at) === todayKey,
  ).length;
  const dailyGoalCurrent = Math.min(completedToday, 1);

  return {
    streak: {
      currentDays,
      helperText:
        currentDays > 0
          ? `${currentDays}-day learning streak.`
          : "Complete a learning check to begin your streak.",
    },
    dailyGoal: {
      type: "learning_checks",
      current: dailyGoalCurrent,
      target: 1,
      isMet: dailyGoalCurrent === 1,
      label: `${dailyGoalCurrent} / 1 learning check`,
    },
  };
}

module.exports = { getLearningMotivation };
