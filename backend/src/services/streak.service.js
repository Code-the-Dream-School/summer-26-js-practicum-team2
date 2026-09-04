const { User } = require("../models/User.model");
const { awardEligibleBadges } = require("./badge.service");

//Get user's date in their timezone
function getDayKey(date, timeZone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

//Updating the streaks and active learning days once a microlesson has been completed
const updateUserStreak = async (userId) => {
  //check for user
  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  const timeZone = user.timezone || "UTC";

  const now = new Date();

  const todayKey = getDayKey(new Date(), timeZone);

  //New user completes first micro-lesson
  if (!user.streak?.last_active_date) {
    user.streak.current = 1;
    user.streak.longest = 1;
    user.streak.active_learning_days = 1;
    user.streak.last_active_date = now;

    await user.save();

    await awardEligibleBadges(userId);
    return;
  }

  const lastActiveKey = getDayKey(user.streak.last_active_date, timeZone);

  //If they already completed a lesson today
  if (todayKey === lastActiveKey) {
    return;
  }

  //Figure out if their Current Streak is still unbroken
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey = getDayKey(yesterday, timeZone);

  if (lastActiveKey === yesterdayKey) {
    user.streak.current += 1;
  } else {
    user.streak.current = 1;
  }

  //Increase Active Learning Days
  user.streak.active_learning_days += 1;

  //Longest Streak
  user.streak.longest = Math.max(user.streak.longest, user.streak.current);

  //Update last active date
  user.streak.last_active_date = now;

  await user.save();

  await awardEligibleBadges(userId);
};

module.exports = { updateUserStreak };
