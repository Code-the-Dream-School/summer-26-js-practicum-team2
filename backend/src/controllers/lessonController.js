const { StatusCodes } = require("http-status-codes");
const UserProgress = require("../models/UserProgress");

// Contnent registery mapping manifest module IDs to JSON content files
const modules = {
  cashFlow: require("../../../shared/content/budgeting.json"),
  //savings: require("../../../shared/content/savings.json"),
  //credit: require("../../../shared/content/credit.json"),
  //debt: require("../../../shared/content/debt.json"),
  //investing: require("../../../shared/content/investing.json"),
};

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
exports.getLesson = async (req, res, next) => {
  try {
    // Destructure moduleId and lessonId from the request parameters
    const { moduleId, lessonId } = req.params;
    const moduleData = modules[moduleId];

    if (!moduleData) {
      // If the moduleId is not found in the modules object, return a 404 error
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Module '${moduleId}' was not found.`,
      });
    }
    // Find the lesson data within the module's lessons array
    const lessonData = moduleData.lessons?.find(
      (lesson) => lesson.id === lessonId,
    );

    if (!lessonData) {
      // If the lessonId is not found in the module's lessons array, return a 404 error
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `Lesson '${lessonId}' was not found in module '${moduleId}'.`,
      });
    }

    // Fetch (without mutating) the user's progress so the frontend can render lesson content and progress state together.
    const progressRecord = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });
    // If no progress record exists, create a new one with default values
    return res.status(StatusCodes.OK).json({
      moduleData,
      lessonData,
      progress: progressRecord ? shapeProgress(progressRecord) : null,
    });
  } catch (error) {
    return next(error);
  }
};

//GET /api/v1/lessons/progress?moduleId=cashFlow
//Returns the user's progress so the frontend can render the learning path without loading lesson content.
exports.getLessonProgress = async (req, res, next) => {
  try {
    // If no moduleId is provided, default to the first module in the modules object
    const moduleId = req.query.moduleId || DEFAULT_MODULE_ID;
    // Find the user's progress for the specified module
    let progressRecord = await UserProgress.findOne({
      user_id: req.user.id,
      module_id: moduleId,
    });
    if (!progressRecord) {
      // If no progress record exists, create a new one with default values
      progressRecord = await UserProgress.create({
        user_id: req.user.id,
        module_id: moduleId,
      });
    }
    // Return the shaped progress data to the frontend
    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};

//PATCH /api/v1/lessons/progress
//Body: { moduleId, lessonId, microLessonId }
//Updates the user's current position so it can be resumed later, without altering completion state.
exports.updateLessonProgress = async (req, res, next) => {
  try {
    // If no moduleId is provided, default to the first module in the modules object
    const { moduleId = DEFAULT_MODULE_ID, lessonId, microLessonId } = req.body;

    // Validate that at least one of lessonId or microLessonId is provided
    if (!lessonId && !microLessonId) {
      // If neither lessonId nor microLessonId is provided, return a 400 error
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "lessonId or microLessonId is required.",
      });
    }

    // Prepare the update object based on the provided lessonId and microLessonId
    const update = {};
    if (lessonId) {
      // If lessonId is provided, update the course_lesson_id
      update.course_lesson_id = lessonId;
    }
    if (microLessonId) {
      // If microLessonId is provided, update the current_micro_lesson_id
      update.current_micro_lesson_id = microLessonId;
    }

    // Find and update the user's progress record for the specified module, or create a new one if it doesn't exist
    const progressRecord = await UserProgress.findOneAndUpdate(
      { user_id: req.user.id, module_id: moduleId },
      { $set: update },
      { upsert: true, new: true },
    );
    // Return the shaped progress data to the frontend
    return res.status(StatusCodes.OK).json(shapeProgress(progressRecord));
  } catch (error) {
    return next(error);
  }
};
