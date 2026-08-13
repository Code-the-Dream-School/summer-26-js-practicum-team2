const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const QuizAttempt = require("../models/QuizAttempt.model");
const { buildLearningPath, pickCurrentNode } = require("../utils/learningPath");

const contentModules = {
  cashFlow: require("../../../shared/content/budgeting.json"),
};
const moduleIds = Object.keys(contentModules);
const DASHBOARD_CACHE_TTL_MS = 30 * 1000;
const dashboardCache = new Map();

function invalidateDashboardCache(userId) {
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

function buildUnit(moduleId, progressRecord) {
  const content = contentModules[moduleId];
  const lessons = getModuleLessons(moduleId);
  const completedSet = new Set(progressRecord?.completed_lessons || []);
  const completedLessons = lessons.filter((lesson) =>
    completedSet.has(lesson.id),
  ).length;

  return {
    id: moduleId,
    name: content.title,
    completedLessons,
    totalLessons: lessons.length,
    totalMicroLessons: lessons.reduce(
      (total, lesson) => total + (lesson.microLessons?.length || 0),
      0,
    ),
    progressPercent: lessons.length
      ? Math.round((completedLessons / lessons.length) * 100)
      : 0,
  };
}

function getNextAction(progressByModule, units) {
  for (const moduleId of moduleIds) {
    const progressRecord = progressByModule.get(moduleId);
    const currentNode = pickCurrentNode(
      buildLearningPath(contentModules[moduleId]),
      progressRecord,
    );
    if (!currentNode || currentNode.isModuleComplete) continue;

    const lesson = findLesson(moduleId, currentNode.lessonId);
    if (!lesson) continue;
    const unit = units.find((item) => item.id === moduleId);
    const hasStarted =
      unit?.completedLessons > 0 ||
      (progressRecord?.completed_micro_lessons?.length || 0) > 0;

    return {
      title: lesson.title,
      description: hasStarted
        ? "Pick up where you left off."
        : "Ready to start? Begin with this lesson.",
      ctaLabel: hasStarted
        ? `Continue ${lesson.title}`
        : `Start ${lesson.title}`,
      href: `/learn/${moduleId}/${lesson.id}`,
    };
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
    streak: { currentDays: 0, helperText: "Streak tracking is coming soon." },
    dailyGoal: {
      type: "lessons",
      current: 0,
      target: 1,
      isMet: false,
      label: "Coming soon",
    },
    primaryAction: { label: nextAction.ctaLabel, href: nextAction.href },
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
    const microLessonIds = passedMicrosByModule.get(attempt.module_id) || [];
    microLessonIds.push(attempt.micro_lesson_id);
    passedMicrosByModule.set(attempt.module_id, microLessonIds);
  }

  await Promise.all(
    [...passedMicrosByModule].map(async ([moduleId, microLessonIds]) => {
      const completedLessons = getModuleLessons(moduleId)
        .filter((lesson) =>
          lesson.microLessons
            ?.filter((micro) =>
              micro.microLessonContent?.some(
                (item) => item.type === "knowledgeCheck",
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
    const prefix = attempt.passed ? "Passed quiz" : "Attempted quiz";
    return {
      id: String(attempt._id),
      label: `${prefix}: ${microLesson?.title || attempt.micro_lesson_id} (${attempt.score}%)`,
      timeLabel: new Date(attempt.submitted_at).toLocaleString(),
    };
  });
}

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = String(req.user.id);
    const cached = dashboardCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return res
        .set("Cache-Control", "private, max-age=30")
        .status(StatusCodes.OK)
        .json(cached.payload);
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
    const payload = {
      hero: getHero(user.name || "Learner", units, nextAction),
      nextAction,
      units,
      recentActivity: await getRecentActivity(userId),
      meta: {
        cachedForMs: DASHBOARD_CACHE_TTL_MS,
        generatedAt: new Date().toISOString(),
      },
    };
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

exports.trackDashboardEvent = async (req, res, next) => {
  try {
    const { type } = req.body || {};
    if (["lesson_complete", "quiz_submit"].includes(type)) {
      invalidateDashboardCache(req.user.id);
    }
    return res
      .status(StatusCodes.ACCEPTED)
      .json({ message: "Dashboard event processed." });
  } catch (error) {
    return next(error);
  }
};

exports.invalidateDashboardCache = invalidateDashboardCache;
