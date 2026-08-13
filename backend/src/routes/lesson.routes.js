const express = require("express");
const jwtMiddleware = require("../middleware/jsonWebToken");
const {
  getLesson,
  getLessonProgress,
  updateLessonProgress,
} = require("../controllers/lesson.controller");

const router = express.Router();

// GET /api/v1/lessons/progress?moduleId=...
router.get("/progress", jwtMiddleware, getLessonProgress);

// PATCH /api/v1/lessons/progress
router.patch("/progress", jwtMiddleware, updateLessonProgress);

// Declared last so "/progress" is not swallowed by the :moduleId param.
// GET /api/v1/lessons/:moduleId/:lessonId
router.get("/:moduleId/:lessonId", jwtMiddleware, getLesson);

module.exports = router;
