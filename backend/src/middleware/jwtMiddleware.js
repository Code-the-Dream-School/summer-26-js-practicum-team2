const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const { User } = require("../models/user.js");
const send401 = (res) => {
  return res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: "No user is authenticated." });
};

module.exports = (req, res, next) => {
  const isLogoutRoute =
    req.path === "/logout" || req.originalUrl?.endsWith("/logout");
  if (isLogoutRoute) {
    return next();
  }
  // Check for token in cookies or Authorization header
  const cookieToken = req?.cookies?.session_token;
  const authHeader = req.get("Authorization") || req.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const token = cookieToken || headerToken;

  if (!token) {
    return send401(res);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return send401(res);
    }
    try {
      const user = await User.findById(decoded.id);
      if (!user || user.is_deleted) {
        return send401(res);
      }
      const tokenVersionInJwt = decoded.token_version ?? 0;
      if (user.token_version !== tokenVersionInJwt) {
        return send401(res);
      }
      req.user = {
        id: user._id,
        role: user.role,
      };
      //req.user = { id: decoded.id, role: decoded.role };

      if (process.env.NODE_ENV === "production") {
        if (
          ["POST", "PATCH", "PUT", "DELETE", "CONNECT"].includes(req.method)
        ) {
          // for these operations we have to check for cross site request forgery
          const csrfHeader = req.get("X-CSRF-TOKEN") || req.get("x-csrf-token");
          if (!csrfHeader || csrfHeader !== decoded.csrfToken) {
            return send401(res);
          }
        }
      }
      return next();
    } catch (error) {
      return next(error);
    }
  });
};
