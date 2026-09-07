export function createRewardToasts(rewards) {
  const toasts = [];

  (rewards?.xp ?? []).forEach((reward) => {
    const messages = {
      quiz_pass: `⭐ +${reward.amount} XP for passing the quiz!`,
      quiz_perfect: `🎯 +${reward.amount} XP for a perfect score!`,
      lesson_complete: `📚 +${reward.amount} XP for completing a lesson!`,
      onboarding_complete: `🌱 +${reward.amount} XP for completing onboarding!`,
    };

    toasts.push({
      variant: "xp",
      message: messages[reward.type],
    });
  });

  if (rewards?.streak?.streakAwarded) {
    toasts.push({
      variant: "streak",
      message: `🔥 ${rewards.streak.currentStreak}-day streak!`,
    });
  }

  (rewards?.badges ?? []).forEach((badge) => {
    toasts.push({
      variant: "badge",
      message: `New Badge Earned: ${badge.icon} ${badge.title}`,
    });
  });

  return toasts;
}
