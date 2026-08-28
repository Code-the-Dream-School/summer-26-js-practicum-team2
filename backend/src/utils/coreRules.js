const XP_CAP = 500;

//Determins how much XP can be awarded when user wins XP based on daily cap and total already awarded for the day
function clampXpAmount(amount, currentTotal = 0) {
  const spaceRemaining = Math.max(0, XP_CAP - currentTotal);
  const clamped = Math.max(0, Math.min(amount, spaceRemaining));

  return {
    amount: clamped,
    capped: amount > spaceRemaining && spaceRemaining > 0,
    remaining: Math.max(0, XP_CAP - (currentTotal + clamped)),
  };
}

//What count as XP award events, how much to award, and when
//Added isFirstPerfect for quiz_perfect, and commented out review_complete and daily_goal_met
function calculateXpDelta({
  eventType,
  currentTotal = 0,
  isFirstTime = false,
  isFirstPass = false,
  isFirstPerfect = false,
  isPerfect = false,
  score = 0,
} = {}) {
  const rules = {
    lesson_complete: { amount: 20 },
    quiz_pass: { amount: 10 },
    quiz_perfect: { amount: 5 },
    onboarding_complete: { amount: 50 },
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

  if (eventType === "quiz_perfect" && (!isPerfect || !isFirstPerfect || score < 100)) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  if (eventType === "onboarding_complete" && (!isFirstTime)) {
    return { amount: 0, capped: false, remaining: Math.max(0, XP_CAP - currentTotal) };
  }

  const adjusted = clampXpAmount(rule.amount, currentTotal);
  return {
    amount: adjusted.amount,
    capped: adjusted.capped,
    remaining: adjusted.remaining,
  };
}

//Calculates local dates for the user for streaks
function toDateKey(dateValue, timezone = "UTC") {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`;
}

//Helper function to replace cursor so that we can stick to local times
// Date keys already normalized to user local time, so using UTC here is only to safely move full days backward/forward
function shiftDateKey(dateKey, days) {
  const date = new Date(`${dateKey}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

//Calculating Streak
function getConsecutiveRunLength(activeSet, endKey) {
  let streak = 0;
  let currentKey = endKey;

  while (activeSet.has(currentKey)) {
    streak += 1;
    currentKey = shiftDateKey(currentKey, -1);
  }

  return streak;
}

//Calculating Streaks removed freeze capabilities
function calculateStreakStatus({ activeDates = [], today = new Date(), timezone = "UTC" } = {}) {
  const activeSet = new Set(
    activeDates.map((value) => toDateKey(value, timezone)).filter((value) => value !== null),
  );

  const todayKey = toDateKey(today, timezone);

  const sortedDates = [...activeSet].sort();
  const lastActiveDate = sortedDates.filter((dateKey) => dateKey <= todayKey).at(-1) || null;

  let currentStreak = lastActiveDate ? getConsecutiveRunLength(activeSet, lastActiveDate) : 0;

  //To make sure current streak is not most recent streak
  if (lastActiveDate !== todayKey && lastActiveDate !== shiftDateKey(todayKey, -1)) {
    currentStreak = 0;
  }

  const longestStreak = sortedDates.reduce((max, dateKey) => {
    let streak = 1;
    let currentKey = dateKey;

    while (true) {
      const nextKey = shiftDateKey(currentKey, 1);

      if (!activeSet.has(nextKey)) {
        break;
      }
      streak += 1;
      currentKey = nextKey;
    }
    return Math.max(max, streak);
  }, 0);

  return { currentStreak, longestStreak };
}

//Calculating total learning days
function calculateLearningDays(activeDates = [], timezone = "UTC") {
  const activeSet = new Set(activeDates.map((value) => toDateKey(value, timezone)).filter(Boolean));
  return activeSet.size;
}

//Calculating whether lesson is unlocked
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
  calculateLearningDays,
  isLessonUnlocked,
};
