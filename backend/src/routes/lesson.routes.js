const express = require("express");
const {
  getLesson,
  getLessonProgress,
  updateLessonProgress,
  getLessonModules,
} = require("../controllers/lesson.controller");

const router = express.Router();

router.get("/modules", getLessonModules);

// GET /api/v1/lessons/progress?moduleId=...
router.get("/progress", getLessonProgress);

// PATCH /api/v1/lessons/progress
router.patch("/progress", updateLessonProgress);

// Declared last so "/progress" is not swallowed by the :moduleId param.
// GET /api/v1/lessons/:moduleId/:lessonId
router.get("/:moduleId/:lessonId", getLesson);

module.exports = router;
