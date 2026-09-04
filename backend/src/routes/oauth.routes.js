const express = require("express");
const passport = require("../config/passport.js");
const {
  completeOAuthLogin,
  getOAuthFailureRedirect,
} = require("../controllers/oauth.controller.js");
const {
  OAUTH_PROVIDER_SCOPES,
  getEnabledOAuthProviders,
  isOAuthProviderEnabled,
} = require("../config/oauthProviders.js");
const { createOAuthState, validateOAuthState } = require("../middleware/oauthState.js");

const router = express.Router();

const logOAuthFailure = (provider, err, info) => {
  if (process.env.NODE_ENV === "test") return;

  const failure = err || info;
  console.error(`[oauth:${provider}] Authentication failed`, {
    name: failure?.name,
    code: failure?.code,
    message: failure?.message,
    statusCode: failure?.oauthError?.statusCode,
  });
};

const requireEnabledProvider = (provider) => (req, res, next) => {
  if (!isOAuthProviderEnabled(provider)) {
    return res.redirect(getOAuthFailureRedirect("OAUTH_PROVIDER_UNAVAILABLE"));
  }
  return next();
};

const startOAuthProvider = (provider) => [
  requireEnabledProvider(provider),
  createOAuthState(provider),
  (req, res, next) =>
    passport.authenticate(provider, {
      scope: OAUTH_PROVIDER_SCOPES[provider],
      state: req.oauth.state,
      session: false,
    })(req, res, next),
];

const completeOAuthProvider = (provider) => [
  validateOAuthState(provider, getOAuthFailureRedirect),
  requireEnabledProvider(provider),
  (req, res, next) =>
    passport.authenticate(provider, { session: false }, (err, user, info) => {
      if (err || !user) {
        logOAuthFailure(provider, err, info);
        return res.redirect(getOAuthFailureRedirect(err?.code || info?.code));
      }

      req.user = user;
      return completeOAuthLogin(req, res, next);
    })(req, res, next),
];

router.get("/providers", (_req, res) => res.json(getEnabledOAuthProviders()));

router.get("/google", ...startOAuthProvider("google"));
router.get("/google/callback", ...completeOAuthProvider("google"));

router.get("/github", ...startOAuthProvider("github"));
router.get("/github/callback", ...completeOAuthProvider("github"));

module.exports = router;
