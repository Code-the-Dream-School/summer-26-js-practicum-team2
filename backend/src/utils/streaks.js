//Update streak UI when user logs in if their streak is broken without updating the database yet
function getDisplayStreak(streak) {
  if (!streak?.last_active_date) {
    return streak?.current ?? 0;
  }

  const daysSinceLastActivity = Math.floor(
    (Date.now() - new Date(streak.last_active_date).getTime()) / (1000 * 60 * 60 * 24),
  );

  return daysSinceLastActivity > 1 ? 0 : (streak.current ?? 0);
}

module.exports = { getDisplayStreak };
