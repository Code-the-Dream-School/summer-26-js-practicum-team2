const express = require("express");
const router = express.Router();
const jwtMiddleware = require("../middleware/jwtMiddleware");
const profileController = require("../controllers/profileController");

router.use(jwtMiddleware);
// GET /api/v1/profile -Fetch user profile and dashboards stats
router.get("/", profileController.getProfile);
// PATCH /api/v1/profile -Update editable field (name, email, goals, preferences)
router.patch("/", profileController.updateProfile);
// POST /api/v1/profile/avatar
router.post("/avatar", profileController.uploadAvatar);
// POST /api/v1/profile/password
router.post("/password", profileController.changePassword);
// DELETE  /api/v1/profile Soft delete account
router.delete("/", profileController.deleteAccount);
module.exports = router;
