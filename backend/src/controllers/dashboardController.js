const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const UserProgress = require("../models/UserProgress");
const QuizAttempt = require("../models/QuizAttempt");

// Content registry mapping module IDs to their lesson JSON, same modules used by lessonController/quizController.
const contentModules = {
  cashFlow: require("../../../shared/content/budgeting.json"),
};
// Cache keys are normalized as strings to avoid ObjectId/string mismatches.
const moduleIds = Object.keys(contentModules);
// Set a short-lived in-memory cache for dashboard responses to reduce database load on repeat requests.
const DASHBOARD_CACHE_TTL_MS = 30 * 1000;
// In-memory dashboard cache
const dashboardCache = new Map();

function invalidateDashboardCache(userId) {
  // Cache keys are normalized as strings to avoid ObjectId/string mismatches.
  dashboardCache.delete(String(userId));
}

function getModuleLessons(moduleId) {
  return contentModules[moduleId]?.lessons || [];
}

function findLesson(moduleId, lessonId) {
  return getModuleLessons(moduleId).find((lesson) => lesson.id === lessonId);
}

function findMicroLesson(moduleId, lessonId, microLessonId) {
  return findLesson(moduleId, lessonId)?.microLessons?.find(
    (micro) => micro.id === microLessonId,
  );
}

// Build a dashboard "unit" (one per learning module) from the module's lesson content and the user's saved progress.
function buildUnit(moduleId, progressRecord) {
  const content = contentModules[moduleId];
  const lessons = getModuleLessons(moduleId);
  const completedSet = new Set(progressRecord?.completed_lessons || []);
  const completedLessons = lessons.filter((lesson) =>
    completedSet.has(lesson.id),
  ).length;
  const totalLessons = lessons.length;
  const totalMicroLessons = lessons.reduce(
    (total, lesson) => total + (lesson.microLessons?.length || 0),
    0,
  );

  return {
    id: moduleId,
    name: content.title,
    completedLessons,
    totalLessons,
    totalMicroLessons,
    progressPercent: totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0,
  };
}

function buildLessonAction(moduleId, lesson, hasStarted) {
  return {
    title: lesson.title,
    description: hasStarted
      ? "Pick up where you left off."
      : "Ready to start? Begin with this lesson.",
    ctaLabel: hasStarted ? `Continue ${lesson.title}` : `Start ${lesson.title}`,
    href: `/learn/${moduleId}/${lesson.id}`,
  };
}

function getNextAction(progressByModule, units) {
  // First priority: resume the user's explicitly saved in-progress lesson.
  for (const moduleId of moduleIds) {
    const progressRecord = progressByModule.get(moduleId);
    const completedSet = new Set(progressRecord?.completed_lessons || []);
    const savedLesson = findLesson(moduleId, progressRecord?.course_lesson_id);

    if (savedLesson && !completedSet.has(savedLesson.id)) {
      return buildLessonAction(moduleId, savedLesson, true);
    }
  }

  // Fallback: pick the first incomplete lesson across modules.
  for (const moduleId of moduleIds) {
    const progressRecord = progressByModule.get(moduleId);
    const completedSet = new Set(progressRecord?.completed_lessons || []);
    const lesson = getModuleLessons(moduleId).find(
      (item) => !completedSet.has(item.id),
    );

    if (lesson) {
      const unit = units.find((item) => item.id === moduleId);
      return buildLessonAction(
        moduleId,
        lesson,
        // Treat as "started" if any lessons were completed or a progress doc exists.
        unit?.completedLessons > 0 || Boolean(progressRecord),
      );
    }
  }

  return {
    title: "Review Quiz",
    description: "Great work. Review a quiz to reinforce what you learned.",
    ctaLabel: "Review a Quiz",
    href: "/learn",
  };
}

function getHero(userName, units, nextAction) {
  const totalLessons = units.reduce((sum, unit) => sum + unit.totalLessons, 0);
  const completedLessons = units.reduce(
    (sum, unit) => sum + unit.completedLessons,
    0,
  );
  const isNewUser = completedLessons === 0;
  const isAllCaughtUp = totalLessons > 0 && completedLessons >= totalLessons;

  let state = "in_progress";
  let greeting = `Welcome back, ${userName}`;
  let statusText = "Nice pace. Your next lesson is ready when you are.";

  if (isNewUser) {
    state = "new_user";
    greeting = `Welcome, ${userName}`;
    statusText = "Start with one short lesson and get your first win today.";
  } else if (isAllCaughtUp) {
    state = "all_caught_up";
    greeting = `You're caught up, ${userName}`;
    statusText =
      "Great work finishing every lesson. A quick review can keep the habit warm.";
  }

  return {
    state,
    displayName: userName,
    greeting,
    statusText,
    // Streak and daily-goal tracking will be implemented in a future update.
    streak: {
      currentDays: 0,
      helperText: "Streak tracking is coming soon.",
    },
    dailyGoal: {
      type: "lessons",
      current: 0,
      target: 1,
      isMet: false,
      label: "Coming soon",
    },
    primaryAction: {
      label: nextAction.ctaLabel,
      href: nextAction.href,
    },
  };
}

async function reconcileProgressFromPassedAttempts(userId) {
  const passedAttempts = await QuizAttempt.find({
    user_id: userId,
    module_id: { $in: moduleIds },
    passed: true,
    submitted_at: { $ne: null },
  }).select("module_id lesson_id micro_lesson_id");

  const passedMicrosByModule = new Map();
  for (const attempt of passedAttempts) {
    // Group passed micro-lesson quizzes by module for batch progress reconciliation.
    const microLessonIds = passedMicrosByModule.get(attempt.module_id) || [];
    microLessonIds.push(attempt.micro_lesson_id);
    passedMicrosByModule.set(attempt.module_id, microLessonIds);
  }

  await Promise.all(
    [...passedMicrosByModule].map(async ([moduleId, microLessonIds]) => {
      const completedLessons = getModuleLessons(moduleId)
        .filter((lesson) =>
          // A lesson is complete once all of its knowledge-check micros are passed.
          lesson.microLessons
            ?.filter((micro) =>
              micro.microLessonContent?.some(
                (contentItem) => contentItem.type === "knowledgeCheck",
              ),
            )
            .every((micro) => microLessonIds.includes(micro.id)),
        )
        .map((lesson) => lesson.id);

      await UserProgress.findOneAndUpdate(
        { user_id: userId, module_id: moduleId },
        {
          $addToSet: {
            completed_micro_lessons: { $each: microLessonIds },
            completed_lessons: { $each: completedLessons },
          },
        },
        { upsert: true },
      );
    }),
  );
}

// Build the recent-activity feed from real, submitted quiz attempts.
async function getRecentActivity(userId) {
  const attempts = await QuizAttempt.find({
    user_id: userId,
    submitted_at: { $ne: null },
  })
    .sort({ submitted_at: -1 })
    .limit(5);

  return attempts.map((attempt) => {
    const microLesson = findMicroLesson(
      attempt.module_id,
      attempt.lesson_id,
      attempt.micro_lesson_id,
    );
    const label = attempt.passed
      ? // Prefer content title; fall back to stored ID when content lookup fails.
        `Passed quiz: ${microLesson?.title || attempt.micro_lesson_id} (${attempt.score}%)`
      : `Attempted quiz: ${microLesson?.title || attempt.micro_lesson_id} (${attempt.score}%)`;

    return {
      id: String(attempt._id),
      label,
      timeLabel: new Date(attempt.submitted_at).toLocaleString(),
    };
  });
}

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = String(req.user.id);
    const cachedDashboard = dashboardCache.get(userId);

    // Serve from short-lived in-memory cache for repeat dashboard loads.
    if (cachedDashboard && cachedDashboard.expiresAt > Date.now()) {
      return res
        .set("Cache-Control", "private, max-age=30")
        .status(StatusCodes.OK)
        .json(cachedDashboard.payload);
    }

    const user = await User.findById(userId).select("name");
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }

    await reconcileProgressFromPassedAttempts(userId);

    const progressRecords = await UserProgress.find({
      user_id: userId,
      module_id: { $in: moduleIds },
    });
    const progressByModule = new Map(
      progressRecords.map((record) => [record.module_id, record]),
    );

    const units = moduleIds.map((moduleId) =>
      buildUnit(moduleId, progressByModule.get(moduleId)),
    );

    const nextAction = getNextAction(progressByModule, units);

    const hero = getHero(user.name || "Learner", units, nextAction);
    const recentActivity = await getRecentActivity(userId);

    const payload = {
      hero,
      nextAction,
      units,
      recentActivity,
      meta: {
        cachedForMs: DASHBOARD_CACHE_TTL_MS,
        generatedAt: new Date().toISOString(),
      },
    };
    // Cache the fully assembled response payload for this user.
    dashboardCache.set(userId, {
      payload,
      expiresAt: Date.now() + DASHBOARD_CACHE_TTL_MS,
    });
    return res
      .set("Cache-Control", "private, max-age=30")
      .status(StatusCodes.OK)
      .json(payload);
  } catch (error) {
    return next(error);
  }
};

// Dashboard state is derived directly from UserProgress/QuizAttempt records,
// so this endpoint just validates and acknowledges client-side telemetry events.
exports.trackDashboardEvent = async (req, res, next) => {
  try {
    const { type, lessonSlug, lessonTitle, quizTitle } = req.body || {};

    if (!["lesson_complete", "quiz_submit"].includes(type)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid dashboard event type." });
    }

    if (type === "lesson_complete" && (!lessonSlug || !lessonTitle)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "lessonSlug and lessonTitle are required for lesson_complete.",
      });
    }

    if (type === "quiz_submit" && !quizTitle) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "quizTitle is required for quiz_submit.",
      });
    }

    invalidateDashboardCache(req.user.id);

    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Dashboard event processed." });
  } catch (error) {
    return next(error);
  }
};

exports.invalidateDashboardCache = invalidateDashboardCache;
