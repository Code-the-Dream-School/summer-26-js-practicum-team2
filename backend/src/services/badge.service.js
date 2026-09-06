const User = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const { BADGES } = require("../utils/badges");

async function awardEligibleBadges(userId) {
  const user = await User.findById(userId);

  if (!user) {
    return [];
  }

  const progress = await UserProgress.findOne({
    user_id: userId,
  });

  const awarded = [];

  //Create array of user's existing badges
  const existingBadgeIds = new Set((user.earned_badges || []).map((badge) => badge.badge_id));

  //FIRST_STEPS BADGE
  //Check if they've completed this microlesson before
  const completedMicroLessons = progress?.completed_micro_lessons?.length || 0;

  if (completedMicroLessons >= 1 && !existingBadgeIds.has(BADGES.FIRST_STEPS.id)) {
    user.earned_badges.push({
      badge_id: BADGES.FIRST_STEPS.id,
      awarded_at: new Date(),
    });

    awarded.push(BADGES.FIRST_STEPS);
  }

  //LEARNING MACHINE BADGE
  if (completedMicroLessons >= 10 && !existingBadgeIds.has(BADGES.LEARNING_MACHINE.id)) {
    user.earned_badges.push({
      badge_id: BADGES.LEARNING_MACHINE.id,
      awarded_at: new Date(),
    });

    awarded.push(BADGES.LEARNING_MACHINE);
  }

  //WEEK STREAK BADGE
  const currentStreak = user.streak?.current ?? 0;
  if (currentStreak >= 7 && !existingBadgeIds.has(BADGES.WEEK_STREAK.id)) {
    user.earned_badges.push({
      badge_id: BADGES.WEEK_STREAK.id,
      awarded_at: new Date(),
    });

    awarded.push(BADGES.WEEK_STREAK);
  }
  await user.save();

  return awarded;
}

module.exports = { awardEligibleBadges };
