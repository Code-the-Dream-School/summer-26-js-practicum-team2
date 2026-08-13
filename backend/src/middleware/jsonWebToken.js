const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const send401 = (res) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticated." });
};

module.exports = (req, res, next) => {
  const token = req?.cookies?.session_token;
  if (!token) {
    return send401(res);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      csrfToken: decoded.csrfToken,
    };

    if (
      process.env.NODE_ENV === "production" &&
      !SAFE_METHODS.has(req.method)
    ) {
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
