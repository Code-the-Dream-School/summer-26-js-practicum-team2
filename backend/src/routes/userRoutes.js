const express = require("express");
const router = express.Router();
const {
  register,
  logon,
  logoff,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");
const jwtMiddleware = require("../middleware/jwtMiddleware");
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiter");

// POST /api/v1/users/register
router.post("/register", registerLimiter, register);
// GET/ verify ? token = (new endpoint for email verification link clicks)
router.get("/verify", verifyEmail);
// POST /api/v1/users/login
router.post("/login", loginLimiter, logon);
// POST /api/v1/users/logout
router.post("/logout", jwtMiddleware, logoff);

//forgot password and reset password

// POST /api/v1/users/forgot-password
router.post("/forgot-password", forgotPassword);
// POST /api/v1/users/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
