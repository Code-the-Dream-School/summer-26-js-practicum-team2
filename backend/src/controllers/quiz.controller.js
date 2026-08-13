//retrieves user progress, quiz attempts, evaluates quiz process submitted quiz grades
//need to import mongoose models for database interactions  which is quizattempt and UserProgress

const EventEmitter = require("events");
const quizEvents = new EventEmitter();
//Event listeners for Quiz Cycle

quizEvents.on(
  "quiz_submit",
  ({ userId, microLessonId, score, attemptNumber }) => {
    console.log(
      `[Event: quiz_submit] User ${userId} submitted ${microLessonId} (Attempt #${attemptNumber}, Score: ${score}%)`,
    );
  },
);
quizEvents.on("quiz_pass", ({ userId, microLessonId }) => {
  console.log(`[Event: quiz_pass] User ${userId} passed quiz ${microLessonId}`);
});
quizEvents.on("quiz_fail", ({ userId, microLessonId }) => {
  console.log(
    `[Event: quiz_fail] User ${userId} did not pass ${microLessonId}`,
  );
});

const QuizAttempt = require("../models/QuizAttempt.model");
const UserProgress = require("../models/UserProgress.model");

//Import Status codes library http-status-codes
const { StatusCodes } = require("http-status-codes");
const { STATUS_CODES } = require("http");

//Contnent registery mapping manifest module IDs to JSON content files
const moduleList = {
  cashFlow: require("../../shared/content/budgeting.json"),
  //savings: require("../../shared/content/savings.json"),
  //credit: require("../../shared/content/credit.json"),
  //debt: require("../../shared/content/debt.json"),
  //investing: require("../../shared/content/investing.json"),
};
const getModuleContent = (moduleId) => {
  const targetModule = moduleId || "cashFlow";
  const content = moduleList[targetModule];
  if (!content) {
    throw new Error(
      `Module '${targetModule}' does not exist or is not found in the list of modules.`,
    );
  }
  return content;
};
//Array comparison helper for single, multi-choice and multi-select questions
const arraysMatch = (arr1 = [], arr2 = []) => {
  const normal1 = Array.isArray(arr1) ? arr1 : [arr1];
  const normal2 = Array.isArray(arr2) ? arr2 : [arr2];
  if (normal1.length !== normal2.length) return false;

  const sorted1 = [...normal1].map(String).sort();
  const sorted2 = [...normal2].map(String).sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};
//search inside modules => lessons ....knowledge check
const getQuestionsFromLesson = (moduleId, microLessonId) => {
  const moduleData = getModuleContent(moduleId);

  //search inside the modules to get the lessons and then inside lessons to get microlessons which then include the knowledgechecks
  for (const lesson of moduleData.lessons || []) {
    for (const micro of lesson.microLessons || []) {
      if (micro.id === microLessonId) {
        return (micro.microLessonContent || []).filter(
          (item) => item.type === "knowledgeCheck",
        );
      }
    }
  }
  return [];
};
//Get user progress . Fetch logged-in user's progress document req.user.id
//if no progress record exists yet, it creates a new UserProgress doc immediately before returning a 200 Ok

// get all micro-lesson IDS that belong to a specific lesson ID
const getMicroLessonIdsForLesson = (moduleId, lessonId) => {
  const moduleData = getModuleContent(moduleId);
  const lesson = (moduleData.lessons || []).find((l) => l.id === lessonId);

  if (!lesson || !lesson.microLessons) return [];
  return lesson.microLessons.map((micro) => micro.id);
};

//GET /api/v1/quizzes/progress
exports.getUserProgress = async (req, res, next) => {
  try {
    let progressRecord = await UserProgress.findOne({ user_id: req.user.id });
    if (!progressRecord) {
      progressRecord = await UserProgress.create({
        user_id: req.user.id,
        module_id: "cashFlow",
      });
    }
    return res.status(StatusCodes.OK).json(progressRecord);
  } catch (error) {
    return next(error);
  }
};

//Route: GET /api/v1/quizzes/attempts
//Function: fetches quiz attempt records linked to user's ID
//need to sort attempts based on results from newest to oldest

exports.getUserAttempts = async (req, res, next) => {
  try {
    let attempts = await QuizAttempt.find({ user_id: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(StatusCodes.OK).json(attempts);
  } catch (error) {
    return next(error);
  }
};

//Route: POST /api/v1/quizzes/start
exports.startQuiz = async (req, res, next) => {
  try {
    const { microLessonId, moduleId = "cashFlow" } = req.body;
    const userId = req.user.id;
    const lessonId = microLessonId.split(".").slice(0, 2).join(".");

    const latestAttempt = await QuizAttempt.findOne({
      user_id: userId,
      micro_lesson_id: microLessonId,
    }).sort({ createdAt: -1 });

    if (
      latestAttempt &&
      Date.now() - new Date(latestAttempt.createdAt).getTime() < 5000
    ) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Please wait 5 seconds before submitting an answer again.",
      });
    }
    const previousCount = await QuizAttempt.countDocuments({
      user_id: userId,
      micro_lesson_id: microLessonId,
    });

    const attemptNumber = previousCount + 1;

    const newAttempt = await QuizAttempt.create({
      user_id: userId,
      module_id: moduleId,
      lesson_id: lessonId,
      micro_lesson_id: microLessonId,
      attempt_number: attemptNumber,
      started_at: new Date(),
    });
    return res.status(StatusCodes.CREATED).json({
      attemptId: newAttempt._id,
      attempt_number: newAttempt.attempt_number,
      micro_lesson_id: newAttempt.micro_lesson_id,
      started_at: newAttempt.started_at,
    });
  } catch (error) {
    return next(error);
  }
};
// Route: POST /api/v1/quizzes/:id/submit
//Function: Submit quiz responses based on courseId, grades answers, logs the number of quiz attempts, updates lesson progress.

exports.submitQuiz = async (req, res, next) => {
  try {
    let microLessonId = req.params.id;
    const userId = req.user.id; //due to middleware from jwt
    const {
      attemptId,
      moduleId = "cashFlow",
      started_at,
      answers = {},
      //questions = [],
    } = req.body;

    //Prevent double-submission of answers by comparing attempt to any prior existing attempt
    //if there is a double answer submission, there is a 409 CONFLICT
    //get lesson id from micro_lesson_id
    const lessonId = microLessonId.split(".").slice(0, 2).join(".");
    // 1. Fetch previous attempt to calculate attempt_number and prevent instant duplicate double clicks
    const contentQuestions = getQuestionsFromLesson(moduleId, microLessonId);
    if (!contentQuestions.length) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `No quiz questions found for micro-lesson '${microLessonId}'.`,
      });
    }
    //Locate existing attempt record

    let attempt;
    if (attemptId) {
      attempt = await QuizAttempt.findOne({ _id: attemptId, user_id: userId });
    } else {
      attempt = await QuizAttempt.findOne({
        user_id: userId,
        micro_lesson_id: microLessonId,
        submitted_at: { $exists: false },
      }).sort({ createdAt: -1 });
    }
    if (!attempt) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "No record of any quiz attempt. Please start Quiz. ",
      });
    }
    if (attempt.submitted_at) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "Your attempt for the quiz has already been submitted.",
      });
    }

    // compare user answer choices and compare to correct answer choice, Figure out the percentage correct since we established that a passing score of 70 is needed to move onto the next question*/
    //Submit grades:
    let correctCount = 0;
    const missed = [];
    const evaluatedAnswers = contentQuestions.map((q) => {
      const rawChoices = answers[q.id] || [];
      const userChoices = Array.isArray(rawChoices) ? rawChoices : [rawChoices];
      const correctAnswers = q.correctResponse || q.correctChoiceIds || [];

      const correctChoices = Array.isArray(correctAnswers)
        ? correctAnswers
        : [correctAnswers];

      const isCorrect = arraysMatch(userChoices, correctChoices);

      if (isCorrect) {
        correctCount++;
      } else {
        missed.push(q.id);
      }

      return {
        question_id: q.id,
        selected_choice_ids: userChoices,
        is_correct: isCorrect,
      };
    });

    const totalQuestions = contentQuestions.length || 1;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passThreshold = 70;
    const passed = score >= passThreshold;

    //Emit events
    quizEvents.emit("quiz_submit", {
      userId,
      microLessonId,
      score,
      attemptNumber: attempt.attempt_number,
    });
    if (passed) {
      quizEvents.emit("quiz_pass", { userId, microLessonId });
    } else {
      quizEvents.emit("quiz_fail", { userId, microLessonId });
    }

    // UPdate and save existing attempt record
    attempt.submitted_at = new Date();
    attempt.score = score;
    attempt.passed = passed;
    attempt.pass_threshold = passThreshold;
    attempt.answers = evaluatedAnswers;
    await attempt.save();

    // save attempt record
    if (passed) {
      /*REMOVE AUGUST 10console.log(
        `[Event: quiz_pass] User ${userId} passed quiz ${microLessonId}`,
      );*/
      const updatedProgress = await UserProgress.findOneAndUpdate(
        { user_id: userId, module_id: moduleId },
        {
          $addToSet: {
            completed_micro_lessons: microLessonId,
          },
          // used by next action in dashboard to point Resume Course button to  user's latest lesson
          $set: {
            current_micro_lesson_id: microLessonId,
          },
        },
        { upsert: true, new: true },
      );
      const allMicroLessonsIds = getMicroLessonIdsForLesson(moduleId, lessonId);
      const userCompletedMicros = new Set(
        updatedProgress.completed_micro_lessons || [],
      );
      const isLessonFullyCompleted =
        allMicroLessonsIds.length > 0 &&
        allMicroLessonsIds.every((id) => userCompletedMicros.has(id));

      // parent lesson will be considered complete only if all micro lessons are finished
      if (isLessonFullyCompleted) {
        await UserProgress.findOneAndUpdate(
          { user_id: userId, module_id: moduleId },
          {
            $addToSet: {
              completed_lessons: lessonId,
            },
          },
        );
      }
    }
    return res.status(StatusCodes.OK).json({
      score: attempt.score,
      passed: attempt.passed,
      attempt_number: attempt.attempt_number,
      missed,
    });
  } catch (error) {
    return next(error);
  }
};
