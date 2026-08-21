const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  maxAge,
});

// Shared by every OAuth provider callback: issue the same session cookie login() creates,
// then hand the browser back to the SPA so it can hydrate auth state via GET /users/me.
const completeOAuthLogin = (req, res) => {
  const user = req.user;
  const csrfToken = crypto.randomUUID();
  const token = jwt.sign({ id: user._id, role: user.role, csrfToken }, JWT_SECRET, {
    expiresIn: "14d",
  });

  res.cookie("session_token", token, getCookieOptions(FOURTEEN_DAYS));
  req.app.emit?.("login_success", {
    userId: user._id,
    email: user.email,
    ip: req.ip,
  });

  return res.redirect(`${CLIENT_URL}/oauth/callback`);
};

const oauthFailureRedirect = `${CLIENT_URL}/login?error=oauth_failed`;

module.exports = { completeOAuthLogin, oauthFailureRedirect };
