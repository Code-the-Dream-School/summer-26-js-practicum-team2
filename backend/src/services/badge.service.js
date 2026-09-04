const { User } = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const { BADGES } = require("../utils/badges");

async function awardEligibleBadges(userId) {
  const user = await User.findById(userId);

  if (!user) {
    console.log("NO USER FOUND");
    return [];
  }

  const progress = await UserProgress.findOne({
    user_id: userId,
  });

  console.log("COMPLETED MICRO LESSONS", progress?.completed_micro_lessons?.length || 0);

  console.log("COMPLETED MICRO LESSON IDS", progress?.completed_micro_lessons);

  const awarded = [];

  //Create array of user's existing badges
  const existingBadgeIds = new Set((user.earned_badges || []).map((badge) => badge.badge_id));

  console.log("CHECKING BADGES FOR", userId);

  //FIRST_STEPS BADGE
  //Check if they've completed this microlesson before
  const completedMicroLessons = progress?.completed_micro_lessons?.length || 0;

  console.log(
    "FIRST STEPS CHECK",
    completedMicroLessons,
    existingBadgeIds.has(BADGES.FIRST_STEPS.id),
  );

  if (completedMicroLessons >= 1 && !existingBadgeIds.has(BADGES.FIRST_STEPS.id)) {
    user.earned_badges.push({
      badge_id: BADGES.FIRST_STEPS.id,
      awarded_at: new Date(),
    });

    awarded.push(BADGES.FIRST_STEPS);
  }

  //LEARNING MACHINE BADGE
  console.log(
    "LEARNING MACHINE CHECK",
    completedMicroLessons,
    existingBadgeIds.has(BADGES.LEARNING_MACHINE.id),
  );
  if (completedMicroLessons >= 5 && !existingBadgeIds.has(BADGES.LEARNING_MACHINE.id)) {
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

  console.log("AWARDED BADGES", awarded);

  return awarded;
}

module.exports = { awardEligibleBadges };
