const express = require("express");
const multer = require("multer");
const { importLessonModule } = require("../controllers/lesson.controller");
const {
  getAdminStatus,
  listUsers,
  resetUserProgress,
  setUserDisabled,
  updateUserRole,
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  seedBudgetingModule,
  createLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/admin.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/status", getAdminStatus);
router.get("/users", listUsers);
router.post("/users/:userId/progress/reset", resetUserProgress);
router.patch("/users/:userId/disabled", setUserDisabled);
router.patch("/users/:userId/role", updateUserRole);
router.get("/modules", listModules);
router.post("/modules/seed-budgeting", seedBudgetingModule);
router.get("/modules/:moduleId", getModule);
router.post("/modules", createModule);
router.patch("/modules/:moduleId", updateModule);
router.delete("/modules/:moduleId", deleteModule);
router.post("/modules/:moduleId/lessons", createLesson);
router.patch("/modules/:moduleId/lessons/:lessonId", updateLesson);
router.delete("/modules/:moduleId/lessons/:lessonId", deleteLesson);
router.post("/modules/import", upload.single("file"), importLessonModule);

module.exports = router;
