const express = require("express");
const {
  getLesson,
  getLessonProgress,
  updateLessonProgress,
  completeLesson,
  restartLessonProgress,
  getLessonModules,
} = require("../controllers/lesson.controller");

const router = express.Router();

router.get("/modules", getLessonModules);

// GET /api/v1/lessons/progress?moduleId=...
router.get("/progress", getLessonProgress);

// PATCH /api/v1/lessons/progress
router.patch("/progress", updateLessonProgress);

// POST /api/v1/lessons/progress/complete
router.post("/progress/complete", completeLesson);

//PATCH /api/v1/lessons/progress/restart
router.patch("/progress/restart", restartLessonProgress);

// Declared last so "/progress" is not swallowed by the :moduleId param.
// GET /api/v1/lessons/:moduleId/:lessonId
router.get("/:moduleId/:lessonId", getLesson);

module.exports = router;
