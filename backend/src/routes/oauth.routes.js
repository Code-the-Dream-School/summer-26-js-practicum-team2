const express = require("express");
const passport = require("../config/passport.js");
const { completeOAuthLogin, oauthFailureRedirect } = require("../controllers/oauth.controller.js");

const router = express.Router();

// GET /api/v1/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
);
// GET /api/v1/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: oauthFailureRedirect }),
  completeOAuthLogin,
);

// GET /api/v1/auth/github
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
// GET /api/v1/auth/github/callback
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: oauthFailureRedirect }),
  completeOAuthLogin,
);

module.exports = router;
