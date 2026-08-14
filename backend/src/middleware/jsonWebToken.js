const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const JWT_SECRET =
  process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const send401 = (res) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticated." });
};

module.exports = (req, res, next) => {
  const cookieToken = req?.cookies?.session_token;
  const authorization = req.get("authorization") || "";
  const headerToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;
  const usedCookieAuth = Boolean(cookieToken);
  const token = cookieToken || headerToken;
  if (!token) {
    return send401(res);
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      csrfToken: decoded.csrfToken,
    };

    if (usedCookieAuth && !SAFE_METHODS.has(req.method)) {
      const csrfHeader = req.get("x-csrf-token");
      if (!csrfHeader || csrfHeader !== decoded.csrfToken) {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json({ message: "Invalid CSRF token." });
      }
    }

    return next();
  } catch {
    return send401(res);
  }
};
