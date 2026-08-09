const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const jwtMiddleware = require("../middleware/jwtMiddleware");

// GET /api/v1/profile -Fetch user profile and dashboards stats
router.get("/", jwtMiddleware, profileController.getProfile);
// PATCH /api/v1/profile/ -Update editable field (name, email, goals, preferences)
router.patch("/", jwtMiddleware, profileController.updateProfile);
//
module.exports = router;
