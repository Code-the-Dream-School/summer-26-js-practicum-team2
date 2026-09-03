const crypto = require("crypto");

const OAUTH_STATE_MAX_AGE = 10 * 60 * 1000;

const usesSecureCookies = () =>
  process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";

const getOAuthCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: usesSecureCookies(),
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/api/v1/auth",
  ...(maxAge !== undefined ? { maxAge } : {}),
});

const getStateCookieName = (provider) => `oauth_state_${provider}`;
const getTermsCookieName = (provider) => `oauth_terms_${provider}`;
const getNextCookieName = (provider) => `oauth_next_${provider}`;

const isSafeLocalPath = (nextPath) => {
  if (typeof nextPath !== "string" || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return false;
  }

  try {
    decodeURIComponent(nextPath);
    return new URL(nextPath, "http://localhost").origin === "http://localhost";
  } catch {
    return false;
  }
};

const getOAuthClearCookieOptions = () => {
  const cookieOptions = getOAuthCookieOptions();
  delete cookieOptions.maxAge;
  return cookieOptions;
};

const clearOAuthCookies = (res, provider) => {
  const cookieOptions = getOAuthClearCookieOptions();
  res.clearCookie(getStateCookieName(provider), cookieOptions);
  res.clearCookie(getTermsCookieName(provider), cookieOptions);
  res.clearCookie(getNextCookieName(provider), cookieOptions);
};

const statesMatch = (expectedState, receivedState) => {
  if (typeof expectedState !== "string" || typeof receivedState !== "string") return false;

  const expectedBuffer = Buffer.from(expectedState);
  const receivedBuffer = Buffer.from(receivedState);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
  );
};

const createOAuthState = (provider) => (req, res, next) => {
  const state = crypto.randomBytes(32).toString("base64url");
  req.oauth = { ...req.oauth, state };

  res.cookie(getStateCookieName(provider), state, getOAuthCookieOptions(OAUTH_STATE_MAX_AGE));
  if (req.query.tos === "true") {
    res.cookie(getTermsCookieName(provider), "true", getOAuthCookieOptions(OAUTH_STATE_MAX_AGE));
  } else {
    res.clearCookie(getTermsCookieName(provider), getOAuthClearCookieOptions());
  }
  if (isSafeLocalPath(req.query.next)) {
    res.cookie(
      getNextCookieName(provider),
      req.query.next,
      getOAuthCookieOptions(OAUTH_STATE_MAX_AGE),
    );
  } else {
    res.clearCookie(getNextCookieName(provider), getOAuthClearCookieOptions());
  }

  return next();
};

const validateOAuthState = (provider, failureRedirect) => (req, res, next) => {
  const expectedState = req.cookies?.[getStateCookieName(provider)];
  const tosAccepted = req.cookies?.[getTermsCookieName(provider)] === "true";
  const nextPath = req.cookies?.[getNextCookieName(provider)];
  const receivedState = req.query.state;

  clearOAuthCookies(res, provider);
  if (!statesMatch(expectedState, receivedState)) {
    return res.redirect(failureRedirect);
  }

  req.oauth = { ...req.oauth, tosAccepted, next: isSafeLocalPath(nextPath) ? nextPath : undefined };
  return next();
};

module.exports = {
  OAUTH_STATE_MAX_AGE,
  createOAuthState,
  getOAuthCookieOptions,
  validateOAuthState,
};
