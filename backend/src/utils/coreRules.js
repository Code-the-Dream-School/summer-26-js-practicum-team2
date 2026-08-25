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
    // review_complete: { amount: 15 },
    // daily_goal_met: { amount: 5 },
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

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

//Calculating streak
function getConsecutiveRunLength(activeSet, endKey, timezone = "UTC") {
  let streak = 0;
  let cursor = new Date(`${endKey}T00:00:00Z`);

  while (true) {
    const key = toDateKey(cursor, timezone);
    if (!activeSet.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
