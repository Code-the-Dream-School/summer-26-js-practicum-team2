const express = require("express");
const router = express.Router();

const jwtMiddleware = require("../middleware/jsonWebToken");
const {authenticateUser, authorizeRoles} = require("../middleware/jsonWebToken");
const {
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
} = require("../controllers/admin.controller");

//Protect routes
router.use(authenticateUser, authorizeRoles("admin"));

//Admin endpoints;
// GET /api/v1/users/register
router.post("/register", registerLimiter, register);
// GET/ verify ? token = (new endpoint for email verification link clicks)
router.get("/verify", verifyEmail);
// POST /api/v1/users/reactivate
router.post("/reactivate", reactivate);
// POST /api/v1/users/login
router.post("/login", loginLimiter, login);
// POST /api/v1/users/logout
router.post("/logout", jwtMiddleware, logout);
// POST /api/v1/users/forgot-password
router.post("/forgot-password", forgotPassword);
// POST /api/v1/users/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
