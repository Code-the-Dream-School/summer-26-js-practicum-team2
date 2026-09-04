const jwt = require("jsonwebtoken");
const { randomUUID } = require("node:crypto");

const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const DEFAULT_SESSION = { maxAge: 14 * 24 * 60 * 60 * 1000, expiresIn: "14d" };
const REMEMBERED_SESSION = { maxAge: 30 * 24 * 60 * 60 * 1000, expiresIn: "30d" };

const getSessionCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  ...(maxAge !== undefined ? { maxAge } : {}),
});

const issueSession = (res, user, { remember = false } = {}) => {
  const session = remember ? REMEMBERED_SESSION : DEFAULT_SESSION;
  const csrfToken = randomUUID();
  const sessionToken = jwt.sign(
    { id: user._id, role: user.role, csrfToken, token_version: user.token_version },
    JWT_SECRET,
    { expiresIn: session.expiresIn },
  );
  res.cookie("session_token", sessionToken, getSessionCookieOptions(session.maxAge));
  return csrfToken;
};

const clearSessionCookie = (res) => {
  res.clearCookie("session_token", getSessionCookieOptions());
};

module.exports = {
  clearSessionCookie,
  getSessionCookieOptions,
  issueSession,
};
