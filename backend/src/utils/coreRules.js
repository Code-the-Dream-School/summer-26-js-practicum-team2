const XP_CAP = 500;

function clampXpAmount(amount, currentTotal = 0) {
  const spaceRemaining = Math.max(0, XP_CAP - currentTotal);
  const clamped = Math.max(0, Math.min(amount, spaceRemaining));

  return {
    amount: clamped,
    capped: amount > spaceRemaining && spaceRemaining > 0,
    remaining: Math.max(0, XP_CAP - (currentTotal + clamped)),
  };
}

function calculateXpDelta({
  eventType,
  currentTotal = 0,
  isFirstTime = false,
  isFirstPass = false,
  isPerfect = false,
  score = 0,
} = {}) {
  const rules = {
    lesson_complete: { amount: 20 },
    quiz_pass: { amount: 10 },
    quiz_perfect: { amount: 5 },
    review_complete: { amount: 15 },
    daily_goal_met: { amount: 5 },
  };

  const rule = rules[eventType];
  if (!rule) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  if (eventType === "lesson_complete" && !isFirstTime) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  if (eventType === "quiz_pass" && (!isFirstPass || score < 70)) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  if (eventType === "quiz_perfect" && (!isPerfect || score < 100)) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  const adjusted = clampXpAmount(rule.amount, currentTotal);
  return {
    amount: adjusted.amount,
    capped: adjusted.capped,
    remaining: adjusted.remaining,
  };
}

function toDateKey(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getConsecutiveRunLength(activeSet, endKey) {
  let streak = 0;
  let cursor = new Date(`${endKey}T00:00:00Z`);

  while (true) {
    const key = toDateKey(cursor);
    if (!activeSet.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function calculateStreakStatus({ activeDates = [], today = new Date(), freezeBalance = 0 } = {}) {
  const activeSet = new Set(
    activeDates.map((value) => toDateKey(value)).filter((value) => value !== null),
  );
  const todayKey = toDateKey(today);
  const yesterday = new Date(`${todayKey}T00:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = toDateKey(yesterday);

  const sortedDates = [...activeSet].sort();
  const lastActiveDate = sortedDates.filter((dateKey) => dateKey <= todayKey).at(-1) || null;

  const currentStreak = lastActiveDate ? getConsecutiveRunLength(activeSet, lastActiveDate) : 0;
  const longestStreak = sortedDates.reduce((max, dateKey) => {
    let streak = 1;
    let cursor = new Date(`${dateKey}T00:00:00Z`);
    while (true) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const nextKey = toDateKey(cursor);
      if (!activeSet.has(nextKey)) break;
      streak += 1;
    }
    return Math.max(max, streak);
  }, 0);

  const freezeUsed =
    freezeBalance > 0 &&
    !activeSet.has(todayKey) &&
    !!lastActiveDate &&
    lastActiveDate !== yesterdayKey;
  const freezesRemaining = Math.max(0, freezeBalance - (freezeUsed ? 1 : 0));

  return {
    currentStreak,
    longestStreak,
    freezeUsed,
    freezesRemaining,
  };
}

function isLessonUnlocked({ lessonId, lessonSequence = [], completedLessons = [] } = {}) {
  if (!lessonId || !Array.isArray(lessonSequence) || lessonSequence.length === 0) {
    return true;
  }

  const index = lessonSequence.indexOf(lessonId);
  if (index <= 0) {
    return true;
  }

  const previousLessonId = lessonSequence[index - 1];
  return completedLessons.includes(previousLessonId);
}

module.exports = {
  XP_CAP,
  calculateXpDelta,
  calculateStreakStatus,
  isLessonUnlocked,
};
