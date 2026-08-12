const express = require("express");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const {
  getLesson,
  getLessonProgress,
  updateLessonProgress,
} = require("../controllers/lessonController");

const router = express.Router();

// GET /api/v1/lessons/:moduleId/:lessonId
// This route fetches the lesson content and the user's progress for that lesson.
router.get("/progress", jwtMiddleware, getLessonProgress);
// PATCH /api/v1/lessons/progress
// This route updates the user's current position in the lesson without altering completion state.
router.patch("/progress", jwtMiddleware, updateLessonProgress);
// GET /api/v1/lessons/:moduleId/:lessonId
// This route fetches the lesson content for a specific module and lesson, along with the user's progress for that lesson.
router.get("/:moduleId/:lessonId", jwtMiddleware, getLesson);

module.exports = router;
