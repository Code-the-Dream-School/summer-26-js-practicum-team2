const express = require("express");
const {
  getAdminStatus,
  listUsers,
  resetUserProgress,
  setUserDisabled,
  updateUserRole,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get("/status", getAdminStatus);
router.get("/users", listUsers);
router.post("/users/:userId/progress/reset", resetUserProgress);
router.patch("/users/:userId/disabled", setUserDisabled);
router.patch("/users/:userId/role", updateUserRole);

module.exports = router;
