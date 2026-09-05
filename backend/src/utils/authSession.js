const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

const getSessionCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  ...(maxAge !== undefined ? { maxAge } : {}),
});

const getAuthenticationFailure = (user) => {
  if (!user?.email_verified_at) {
    return {
      status: StatusCodes.FORBIDDEN,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before logging in.",
    };
  }

  return null;
};

const issueAuthenticatedSession = ({ req, res, user, remember = false, emitLoginEvent = true }) => {
  const maxAge = remember ? THIRTY_DAYS : FOURTEEN_DAYS;
  const tokenExpiry = remember ? "30d" : "14d";
  const csrfToken = crypto.randomUUID();
  const token = jwt.sign({ id: user._id, role: user.role, csrfToken }, JWT_SECRET, {
    expiresIn: tokenExpiry,
  });

  res.cookie("session_token", token, getSessionCookieOptions(maxAge));
  if (emitLoginEvent) {
    req.app.emit?.("login_success", {
      userId: user._id,
      email: user.email,
      ip: req.ip,
    });
  }

  return { csrfToken, token };
};

module.exports = {
  getAuthenticationFailure,
  getSessionCookieOptions,
  issueAuthenticatedSession,
};
