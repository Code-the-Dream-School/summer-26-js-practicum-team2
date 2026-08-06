const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");

// Temporary in-memory store for user progress and activity
const unitsBlueprint = [
  {
    id: "budgeting-and-cash-flow-basics",
    name: "Budgeting and Cash Flow Basics",
    lessons: [
      { slug: "cash-flow", title: "What is Cash Flow and a Budget?" },
      { slug: "income", title: "Income" },
      { slug: "needs-vs-wants", title: "Understanding Needs vs Wants" },
      {
        slug: "fixed-vs-variable-expenses",
        title: "Fixed vs Variable Expenses",
      },
      { slug: "creating-a-budget", title: "Creating a Budget" },
      { slug: "tracking-your-expenses", title: "Tracking Your Expenses" },
    ],
  },
];

// Temporary in-memory store for user progress and activity
const progressStore = {};

// Utility functions for managing user progress and activity
const dayKey = (date = new Date()) => date.toISOString().slice(0, 10); // Returns a string in the format "YYYY-MM-DD"

function getProgress(userId) {
  if (!progressStore[userId]) {
    // Initialize the user's progress if it doesn't exist
    progressStore[userId] = {
      completedLessons: [],
      inProgressLesson: null,
      reviewQuizAvailable: false,
      activity: [],
      activeDays: [],
    };
  }
  // Return the user's progress object
  return progressStore[userId];
}

function addUnique(array, value) {
  // Add a value to an array only if it doesn't already exist in the array
  if (!array.includes(value)) {
    array.push(value);
  }
}

function calculateStreak(activeDays) {
  if (!Array.isArray(activeDays) || activeDays.length === 0) {
    // If there are no active days, the streak is 0
    return 0;
  }

  // Create a Set from the activeDays array for efficient lookup
  const daySet = new Set(activeDays);
  let streak = 0;
  const cursor = new Date();

  while (daySet.has(dayKey(cursor))) {
    // If the current day is in the activeDays set, increment the streak and move to the previous day
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Return the calculated streak length
  return streak;
}

function getUnits(completedLessonSlugs) {
  // Create a Set from the completedLessonSlugs array for efficient lookup
  const completedSet = new Set(completedLessonSlugs);

  return unitsBlueprint.map((unit) => {
    // Count the number of completed lessons in the unit by filtering the lessons array
    const completedLessons = unit.lessons.filter((lesson) =>
      completedSet.has(lesson.slug),
    ).length;
    // Get the total number of lessons in the unit
    const totalLessons = unit.lessons.length;
    // Calculate the progress percentage for the unit, rounded to the nearest whole number
    return {
      id: unit.id,
      name: unit.name,
      completedLessons,
      totalLessons,
      progressPercent: Math.round((completedLessons / totalLessons) * 100),
    };
  });
}

function getNextAction(progress, units) {
  // Create a Set from the completedLessons array for efficient lookup
  const completedSet = new Set(progress.completedLessons);

  if (
    progress.inProgressLesson &&
    !completedSet.has(progress.inProgressLesson.slug)
  ) {
    // If there is an in-progress lesson that hasn't been completed, return it as the next action
    return {
      title: progress.inProgressLesson.title,
      description: "Pick up where you left off.",
      ctaLabel: `Continue ${progress.inProgressLesson.title}`,
      href: `/lessons/${progress.inProgressLesson.slug}`,
    };
  }
  // Iterate through the units to find the next lesson to take
  for (const unit of units) {
    if (unit.completedLessons < unit.totalLessons) {
      // If there are still lessons to complete in the unit, find the next lesson to take
      const fullUnit = unitsBlueprint.find((item) => item.id === unit.id);
      const nextLesson = fullUnit.lessons.find(
        (lesson) => !completedSet.has(lesson.slug),
      );

      if (nextLesson) {
        // Return the next lesson as the next action with appropriate details
        return {
          title: nextLesson.title,
          description:
            unit.completedLessons > 0
              ? "Your next lesson in this unit is ready."
              : "Ready to start? Begin with this lesson.",
          ctaLabel: `Start ${nextLesson.title}`,
          href: `/lessons/${nextLesson.slug}`,
        };
      }
    }
  }
  // If all lessons are completed, return the review quiz as the next action
  return {
    title: "Review Quiz",
    description: progress.reviewQuizAvailable
      ? "Keep your momentum with a quick review quiz."
      : "Great work. Review a quiz to reinforce what you learned.",
    ctaLabel: "Review a Quiz",
    href: "/quizzes/review",
  };
}

function getHero(userName, progress, units, nextAction) {
  const totalLessons = units.reduce((sum, unit) => sum + unit.totalLessons, 0);
  const completedCount = progress.completedLessons.length;
  const today = dayKey();
  // Calculate the number of lessons completed today by filtering the activity array for "lesson_complete" events that occurred today
  const completedToday = progress.activity.filter(
    (entry) =>
      // Check if the entry is a "lesson_complete" event and if it occurred today
      entry.type === "lesson_complete" &&
      dayKey(new Date(entry.timestamp)) === today,
  ).length;

  // Define the daily goal for lessons, the current progress towards that goal, and whether the goal has been met
  const goalTarget = 2;
  const goalCurrent = Math.min(completedToday, goalTarget);
  const isGoalMet = goalCurrent >= goalTarget;
  const streak = calculateStreak(progress.activeDays);
  const allCaughtUp = completedCount >= totalLessons && isGoalMet;
  // Determine the state of the dashboard hero based on the user's progress and activity
  let state = "in_progress";
  let greeting = `Good morning, ${userName}`;
  let statusText = "Nice pace. Your next lesson is ready when you are.";
  let streakHelperText =
    streak > 0 ? "Active through today" : "One lesson keeps it going.";

  if (completedCount === 0 && !progress.inProgressLesson) {
    // If the user has not completed any lessons and has no in-progress lesson, set the state to "new_user" and provide a welcome message
    state = "new_user";
    greeting = `Welcome, ${userName}`;
    statusText = "Start with one short lesson and get your first win today.";
    streakHelperText = "Start your streak with a lesson.";
  } else if (allCaughtUp) {
    // If the user has completed all lessons and met their daily goal, set the state to "all_caught_up" and provide a congratulatory message
    state = "all_caught_up";
    greeting = `You're caught up, ${userName}`;
    statusText =
      "Today's goal is done. A quick review can keep the habit warm.";
    streakHelperText = "Today's activity is counted.";
  } else if (!isGoalMet) {
    // If the user has not met their daily goal, provide a status update on the remaining lessons
    const remaining = goalTarget - goalCurrent;
    statusText = `You're ${remaining} lesson${remaining === 1 ? "" : "s"} from today's goal.`;
  }
  // Return an object containing the hero information to be displayed on the dashboard
  return {
    state,
    displayName: userName,
    greeting,
    statusText,
    streak: {
      currentDays: streak,
      helperText: streakHelperText,
    },
    dailyGoal: {
      type: "lessons",
      current: goalCurrent,
      target: goalTarget,
      isMet: isGoalMet,
      label: `${goalCurrent} / ${goalTarget} lessons`,
    },
    primaryAction: {
      label: nextAction.ctaLabel,
      href: nextAction.href,
    },
  };
}

function getRecentActivity(activity) {
  // Return the last 5 activity entries in reverse order, mapping them to a new format with id, label, and timeLabel properties
  return activity
    .slice(-5)
    .reverse()
    .map((entry, index) => ({
      id: `${entry.type}-${entry.timestamp}-${index}`,
      label: entry.label,
      timeLabel: new Date(entry.timestamp).toLocaleString(),
    }));
}

exports.getDashboard = async (req, res, next) => {
  try {
    // Ensure the user is authenticated and has a valid user ID
    const userId = String(req.user.id);

    const user = await User.findById(userId).select("name");
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }
    // Retrieve the user's progress and activity from the in-memory store
    const progress = getProgress(userId);
    const units = getUnits(progress.completedLessons);
    const nextAction = getNextAction(progress, units);
    const hero = getHero(user.name || "Learner", progress, units, nextAction);
    const recentActivity = getRecentActivity(progress.activity);
    // Construct the payload to be sent in the response, including hero, nextAction, units, recentActivity, and meta information
    const payload = {
      hero,
      nextAction,
      units,
      recentActivity,
      meta: {
        cachedForMs: 0,
        generatedAt: new Date().toISOString(),
      },
    };
    // Send the payload as a JSON response with a 200 OK status code
    return res.status(StatusCodes.OK).json(payload);
  } catch (error) {
    // If an error occurs during the process, pass the error to the next middleware for handling
    return next(error);
  }
};

// Track dashboard events such as lesson completions and quiz submissions
exports.trackDashboardEvent = async (req, res, next) => {
  try {
    // Ensure the user is authenticated and has a valid user ID
    const userId = String(req.user.id);
    const progress = getProgress(userId);
    const { type, lessonSlug, lessonTitle, quizTitle, inProgressLesson } =
      req.body || {};

    if (!["lesson_complete", "quiz_submit"].includes(type)) {
      // If the event type is not recognized, return a 400 Bad Request response with an error message
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid dashboard event type." });
    }

    if (type === "lesson_complete" && (!lessonSlug || !lessonTitle)) {
      // If the lesson_complete event is missing required fields, return a 400 Bad Request response with an error message
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "lessonSlug and lessonTitle are required for lesson_complete.",
      });
    }

    if (type === "quiz_submit" && !quizTitle) {
      // If the quiz_submit event is missing the quizTitle field, return a 400 Bad Request response with an error message
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "quizTitle is required for quiz_submit.",
      });
    }

    if (type === "lesson_complete") {
      // Process the lesson_complete event by updating the user's progress and activity
      addUnique(progress.completedLessons, lessonSlug);
      progress.inProgressLesson = null;
      addUnique(progress.activeDays, dayKey());
      progress.activity.push({
        type,
        label: `Completed ${lessonTitle}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (type === "quiz_submit") {
      // Process the quiz_submit event by updating the user's progress and activity
      progress.reviewQuizAvailable = true;
      addUnique(progress.activeDays, dayKey());
      progress.activity.push({
        type,
        label: `Submitted ${quizTitle}`,
        timestamp: new Date().toISOString(),
      });
    }

    if (inProgressLesson?.slug && inProgressLesson?.title) {
      // If an inProgressLesson is provided, update the user's inProgressLesson in their progress
      progress.inProgressLesson = {
        slug: inProgressLesson.slug,
        title: inProgressLesson.title,
      };
    }
    // Return a 202 Accepted response indicating that the dashboard event has been processed successfully
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Dashboard event processed." });
  } catch (error) {
    return next(error);
  }
};
