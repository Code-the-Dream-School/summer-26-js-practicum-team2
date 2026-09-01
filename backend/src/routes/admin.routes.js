const express = require("express");
const multer = require("multer");
const { importLessonModule } = require("../controllers/lesson.controller");
const {
  getAdminStatus,
  listUsers,
  seedRandomUsers,
  resetUserProgress,
  setUserDisabled,
  updateUserRole,
  verifyUserEmail,
  setUserDeleted,
  hardDeleteUser,
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  seedBudgetingModule,
  createLesson,
  updateLesson,
  deleteLesson,
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
  reactivateUserAcct,
} = require("../controllers/admin.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/status", getAdminStatus);
router.get("/users", listUsers);
router.post("/users/seed-random", seedRandomUsers);
router.post("/users/:userId/progress/reset", resetUserProgress);
router.patch("/users/:userId/disabled", setUserDisabled);
router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/verify-email", verifyUserEmail);
router.patch("/users/:userId/deleted", setUserDeleted);
router.delete("/users/:userId", hardDeleteUser);
router.get("/deletions/pending", getPendingDeleteAccount);
router.patch("/deletions/approve/:userId", approveDeleteAccount);
router.patch("/deletions/deny/:userId", rejectDeleteAccount);
router.patch("/deletions/reactivate/:userId", reactivateUserAcct);
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
