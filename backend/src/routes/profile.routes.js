const express = require("express");
const router = express.Router();
//const jwtMiddleware = require("../middleware/jsonWebToken"); - need to remove because of admin update
const {authenticateUser} = require("../middleware/jsonWebToken");

const profileController = require("../controllers/profile.controller");
router.use(authenticateUser);
//router.use(jwtMiddleware); - needed to remove since i added changes to use and admin role
// GET /api/v1/profile -Fetch user profile and dashboards stats
router.get("/", profileController.getProfile);
// PATCH /api/v1/profile -Update editable field (name, email, goals, preferences)
router.patch("/", profileController.updateProfile);
// POST /api/v1/profile/avatar
router.post("/avatar", profileController.uploadAvatar);
// POST /api/v1/profile/password
router.post("/password", profileController.changePassword);
// POST  /api/v1/profile/request-deletion Soft delete account
router.post("/request-deletion", profileController.deleteAccount);
module.exports = router;
