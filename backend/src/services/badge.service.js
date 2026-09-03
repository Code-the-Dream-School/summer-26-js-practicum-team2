const { User } = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const { BADGES } = require("../utils/badges");

async function awardEligibleBadges(userId) {
  console.log("CHECKING BADGES FOR", userId);
  const user = await User.findById(userId);

  if (!user) {
    console.log("NO USER FOUND");
    return [];
  }

  const progress = await UserProgress.findOne({
    user_id: userId,
  });

  console.log("COMPLETED MICRO LESSONS", progress?.completed_micro_lessons?.length || 0);

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

  await user.save();

  console.log("BADGES AWARDED", awarded);
  return awarded;
}

module.exports = { awardEligibleBadges };
