const { StatusCodes } = require("http-status-codes");
const UserProgress = require("../models/UserProgress.model");
const LessonModule = require("../models/LessonModule.model");
const QuizAttempt = require("../models/QuizAttempt.model");
const { invalidateDashboardCache } = require("./dashboard.controller");
const {
  getModule,
  getLesson,
  sanitizeLessonData,
  sanitizeModuleData,
  clearModuleCache,
} = require("../utils/content");
const {
  lessonProgressSchema,
  lessonCompletionSchema,
  lessonImportSchema,
  validateRequest,
} = require("../validation/userValidation");
const { updateUserStreak } = require("../services/streak.service");
const { awardEligibleBadges } = require("../services/badge.service");

const DEFAULT_MODULE_ID = "cashFlow";

// Shape a UserProgress document into the fields the frontend needs to render the learning path.
function shapeProgress(progressRecord) {
  return {
    currentModule: progressRecord.module_id,
    currentLessonId: progressRecord.course_lesson_id,
    currentMicroLessonId: progressRecord.current_micro_lesson_id,
    currentChunkIndex: progressRecord.current_chunk_index,
    completedLessons: progressRecord.completed_lessons,
    completedMicroLessons: progressRecord.completed_micro_lessons,
    isModuleCompleted: progressRecord.is_module_completed,
  };
}

exports.getLessonModules = async (req, res, next) => {
  try {
    const modules = await LessonModule.find({}).select("id title lessons").sort({ id: 1 }).lean();
    return res.status(StatusCodes.OK).json({
      modules: modules.map(({ id, title, lessons }) => ({
        id,
        title,
        firstLessonId: lessons?.[0]?.id ?? null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/lessons/:moduleId/:lessonId
// Returns the module + lesson content along with the caller's progress, without mutating it.
exports.getLesson = async (req, res, next) => {
  try {
    const { moduleId, lessonId } = req.params;

    const moduleData = await getModule(moduleId);
    if (!moduleData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const lessonData = await getLesson(moduleId, lessonId);
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
      moduleData: sanitizeModuleData(moduleData),
      lessonData: sanitizeLessonData(lessonData),
      progress: progressRecord ? shapeProgress(progressRecord) : null,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/lessons/public/:moduleId/:lessonId
// Returns sanitized lesson content for signed-out previews without reading user progress.
exports.getPublicLesson = async (req, res, next) => {
  try {
    const { moduleId, lessonId } = req.params;

    const moduleData = await getModule(moduleId);
    if (!moduleData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const lessonData = await getLesson(moduleId, lessonId);
    if (!lessonData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Lesson '${lessonId}' was not found in module '${moduleId}'.`,
      });
    }

    return res.status(StatusCodes.OK).json({
      moduleData: sanitizeModuleData(moduleData),
      lessonData: sanitizeLessonData(lessonData),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/lessons/progress?moduleId=cashFlow
// Returns progress only, so the learning path can render without loading lesson content.
exports.getLessonProgress = async (req, res, next) => {
  try {
    const moduleId = req.query.moduleId;
    if (!moduleId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "A moduleId is required to load lesson progress.",
      });
    }

    if (!(await getModule(moduleId))) {
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
    const { moduleId = DEFAULT_MODULE_ID, microLessonId } = req.body ?? {};
    if (
      typeof moduleId !== "string" ||
      typeof microLessonId !== "string" ||
      !microLessonId.trim()
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "A moduleId and microLessonId are required." });
    }
    const moduleData = await getModule(moduleId);
    const micro = moduleData?.lessons
      ?.flatMap((lesson) => lesson.microLessons || [])
      .find((item) => item.id === microLessonId);
    if (!micro) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Micro-lesson not found." });
    }
    if (micro.microLessonContent?.some((item) => item.type === "knowledgeCheck")) {
      const passedAttempt = await QuizAttempt.exists({
        user_id: req.user.id,
        module_id: moduleId,
        micro_lesson_id: microLessonId,
        passed: true,
        submitted_at: { $ne: null },
      });
      if (!passedAttempt) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ message: "Pass every knowledge check before completing this micro-lesson." });
      }
    }

    const progress = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });

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
        returnDocument: "after",
      },
    );

    let streakAward = null;

    //If this is first completion, udpate the streak and award the badge
    if (!alreadyCompleted) {
      streakAward = await updateUserStreak(req.user.id);
    }

    const awardedBadges = await awardEligibleBadges(req.user.id);

    invalidateDashboardCache(req.user.id);

    return res.status(StatusCodes.OK).json({
      progress: shapeProgress(updatedProgress),
      rewards: {
        streak: streakAward,
        badges: awardedBadges,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/v1/lessons/progress
// Body: { moduleId, lessonId, microLessonId, currentChunkIndex }
// Saves the caller's current position so it can be resumed later. Completion state is untouched.
exports.updateLessonProgress = async (req, res, next) => {
  try {
    const { lessonId, microLessonId } = req.body ?? {};

    if (!lessonId && !microLessonId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "lessonId or microLessonId is required.",
      });
    }

    const validatedBody = validateRequest(res, lessonProgressSchema, req.body);
    if (!validatedBody) return;

    const {
      moduleId = DEFAULT_MODULE_ID,
      lessonId: validatedLessonId,
      microLessonId: validatedMicroLessonId,
      currentChunkIndex,
    } = validatedBody;

    if (!(await getModule(moduleId))) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const update = {};
    if (validatedLessonId) {
      update.course_lesson_id = validatedLessonId;
    }
    if (validatedMicroLessonId) {
      update.current_micro_lesson_id = validatedMicroLessonId;
    }
    if (typeof currentChunkIndex === "number") {
      update.current_chunk_index = currentChunkIndex;
    }
    if (typeof currentChunkIndex === "number") {
      update.current_chunk_index = currentChunkIndex;
    }

    const progressRecord = await UserProgress.findOneAndUpdate(
      { user_id: req.user.id, module_id: moduleId },
      { $set: update },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    invalidateDashboardCache(req.user.id);

    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};

exports.completeLesson = async (req, res, next) => {
  try {
    const validatedBody = validateRequest(res, lessonCompletionSchema, req.body);
    if (!validatedBody) return;
    const { moduleId, lessonId } = validatedBody;
    const moduleData = await LessonModule.findOne({ id: moduleId }).select("lessons").lean();

    if (!moduleData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }

    const lesson = (moduleData.lessons || []).find((item) => item.id === lessonId);
    if (!lesson) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Lesson '${lessonId}' was not found in module '${moduleId}'.`,
      });
    }

    const microLessonIds = (lesson.microLessons || []).map((microLesson) => microLesson.id);
    const quizMicroLessonIds = (lesson.microLessons || [])
      .filter((microLesson) =>
        microLesson.microLessonContent?.some((item) => item.type === "knowledgeCheck"),
      )
      .map((microLesson) => microLesson.id);

    if (quizMicroLessonIds.length > 0) {
      const passedAttempts = await QuizAttempt.find({
        user_id: req.user.id,
        module_id: moduleId,
        lesson_id: lessonId,
        micro_lesson_id: { $in: quizMicroLessonIds },
        passed: true,
        submitted_at: { $ne: null },
      }).select("micro_lesson_id");
      const passedMicroLessonIds = new Set(
        passedAttempts.map((attempt) => attempt.micro_lesson_id),
      );

      if (!quizMicroLessonIds.every((microLessonId) => passedMicroLessonIds.has(microLessonId))) {
        return res.status(StatusCodes.CONFLICT).json({
          message: "Pass every knowledge check before completing this lesson.",
        });
      }
    }

    const positionUpdate = {
      course_lesson_id: lessonId,
      current_chunk_index: 0,
    };
    if (microLessonIds.length > 0) {
      positionUpdate.current_micro_lesson_id = microLessonIds[microLessonIds.length - 1];
    }

    const progressUpdate = {
      $set: positionUpdate,
      $addToSet: {
        completed_lessons: lessonId,
      },
    };
    if (microLessonIds.length > 0) {
      progressUpdate.$addToSet.completed_micro_lessons = { $each: microLessonIds };
    }

    const progressRecord = await UserProgress.findOneAndUpdate(
      { user_id: req.user.id, module_id: moduleId },
      progressUpdate,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
    const completedLessonIds = new Set(progressRecord.completed_lessons || []);
    const isModuleCompleted =
      moduleData.lessons.length > 0 &&
      moduleData.lessons.every((moduleLesson) => completedLessonIds.has(moduleLesson.id));

    if (progressRecord.is_module_completed !== isModuleCompleted) {
      progressRecord.is_module_completed = isModuleCompleted;
      await progressRecord.save();
    }

    invalidateDashboardCache(req.user.id);
    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};

//For restarting lesson progress when the start over button is clicked
exports.restartLessonProgress = async (req, res, next) => {
  try {
    const { moduleId = DEFAULT_MODULE_ID } = req.body;

    const moduleData = await getModule(moduleId);

    if (!moduleData) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module ${moduleId} was not found.`,
      });
    }

    const firstLesson = moduleData.lessons?.[0];
    const firstMicroLesson = firstLesson?.microLessons?.[0];

    const progressRecord = await UserProgress.findOneAndUpdate(
      {
        user_id: req.user.id,
        module_id: moduleId,
      },
      {
        $set: {
          course_lesson_id: firstLesson.id,
          current_micro_lesson_id: firstMicroLesson.id,
          current_chunk_index: 0,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};

// POST /api/v1/lessons/import
// Upserts a complete lesson module from a trusted operator request.
exports.importLessonModule = async (req, res, next) => {
  try {
    let importBody = req.body;
    if (req.file) {
      if (!req.file.originalname.toLowerCase().endsWith(".json")) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Lesson imports must be .json files.",
        });
      }

      try {
        importBody = JSON.parse(req.file.buffer.toString("utf8"));
      } catch {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Uploaded lesson file contains invalid JSON.",
        });
      }
    }

    const validatedBody = validateRequest(res, lessonImportSchema, importBody);
    if (!validatedBody) return;

    const lessonModule = await LessonModule.findOneAndUpdate(
      { id: validatedBody.id },
      validatedBody,
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    ).lean();

    clearModuleCache(validatedBody.id);
    return res.status(StatusCodes.OK).json(lessonModule);
  } catch (error) {
    return next(error);
  }
};
