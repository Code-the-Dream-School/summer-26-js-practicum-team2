const { StatusCodes } = require("http-status-codes");
const UserProgress = require("../models/UserProgress.model");
const { getModule, getLesson } = require("../utils/content");
const { updateUserStreak } = require("../services/streak.service");
const { invalidateDashboardCache } = require("./dashboard.controller");
const { awardEligibleBadges } = require("../services/badge.service");

const DEFAULT_MODULE_ID = "cashFlow";

// Shape a UserProgress document into the fields the frontend needs to render the learning path.
function shapeProgress(progressRecord) {
  return {
    currentModule: progressRecord.module_id,
    currentLessonId: progressRecord.course_lesson_id,
    currentMicroLessonId: progressRecord.current_micro_lesson_id,
    completedLessons: progressRecord.completed_lessons,
    completedMicroLessons: progressRecord.completed_micro_lessons,
    isModuleCompleted: progressRecord.is_module_completed,
  };
}

// GET /api/v1/lessons/:moduleId/:lessonId
// Returns the module + lesson content along with the caller's progress, without mutating it.
exports.getLesson = async (req, res, next) => {
  try {
    const { moduleId, lessonId } = req.params;

    const moduleData = getModule(moduleId);
    if (!moduleData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const lessonData = getLesson(moduleId, lessonId);
    if (!lessonData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Lesson '${lessonId}' was not found in module '${moduleId}'.`,
      });
    }

    const progressRecord = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });

    return res.status(StatusCodes.OK).json({
      moduleData,
      lessonData,
      progress: progressRecord ? shapeProgress(progressRecord) : null,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/lessons/progress?moduleId=cashFlow
// Returns progress only, so the learning path can render without loading lesson content.
exports.getLessonProgress = async (req, res, next) => {
  try {
    const moduleId = req.query.moduleId || DEFAULT_MODULE_ID;

    if (!getModule(moduleId)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    let progressRecord = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });

    if (!progressRecord) {
      progressRecord = await UserProgress.create({
        user_id: req.user.id,
        module_id: moduleId,
      });
    }

    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/lessons/complete
exports.completeMicroLesson = async (req, res, next) => {
  try {
    const { moduleId = DEFAULT_MODULE_ID, microLessonId } = req.body;

    const progress = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });

    console.log("CURRENT COMPLETED LESSONS", progress?.completed_micro_lessons);

    console.log(
      "CURRENT COMPLETED MICRO LESSONS LENGTH",
      progress?.completed_micro_lessons?.length,
    );

    console.log("INCOMING LESSON", microLessonId);
    const alreadyCompleted = progress?.completed_micro_lessons?.includes(microLessonId) || false;

    const updatedProgress = await UserProgress.findOneAndUpdate(
      {
        user_id: req.user.id,
        module_id: moduleId,
      },
      {
        $addToSet: {
          completed_micro_lessons: microLessonId,
        },
        $set: {
          current_micro_lesson_id: microLessonId,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    console.log("LESSON COMPLETE CHECK", microLessonId, alreadyCompleted);

    //If this is first completion, udpate the streak and award the badge
    if (!alreadyCompleted) {
      await updateUserStreak(req.user.id);
    }

    await awardEligibleBadges(req.user.id);

    invalidateDashboardCache(req.user.id);

    return res.status(StatusCodes.OK).json(shapeProgress(updatedProgress));
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/v1/lessons/progress
// Body: { moduleId, lessonId, microLessonId }
// Saves the caller's current position so it can be resumed later. Completion state is untouched.
exports.updateLessonProgress = async (req, res, next) => {
  try {
    const { moduleId = DEFAULT_MODULE_ID, lessonId, microLessonId } = req.body;

    if (!lessonId && !microLessonId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "lessonId or microLessonId is required.",
      });
    }

    if (!getModule(moduleId)) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const update = {};
    if (lessonId) {
      update.course_lesson_id = lessonId;
    }
    if (microLessonId) {
      update.current_micro_lesson_id = microLessonId;
    }

    const progressRecord = await UserProgress.findOneAndUpdate(
      { user_id: req.user.id, module_id: moduleId },
      {
        $set: update,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    invalidateDashboardCache(req.user.id);

    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};
