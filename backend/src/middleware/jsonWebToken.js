const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const send401 = (res) => {
  return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No user is authenticated." });
};

const authenticateUser = async (req, res, next) => {
  const cookieToken = req?.cookies?.session_token;
  const authorization = req.get("authorization") || "";
  const headerToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : null;
  const usedCookieAuth = Boolean(cookieToken);
  const token = cookieToken || headerToken;
  if (!token) {
    return send401(res);
  }
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return send401(res);
  }

  try {
    const user = await User.findById(decoded.id).select(
      "role is_disabled deleted_at token_version",
    );
    const tokenVersionInJwt = decoded.token_version ?? 0;
    if (!user || user.token_version !== tokenVersionInJwt) {
      return send401(res);
    }

    if (user.is_disabled) {
      res.clearCookie("session_token", { httpOnly: true, sameSite: "lax", path: "/" });
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "This account has been banned or disabled." });
    }

    if (user.deleted_at) {
      res.clearCookie("session_token", { httpOnly: true, sameSite: "lax", path: "/" });
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "This account is scheduled for deletion." });
    }

    req.user = {
      id: user._id,
      role: user.role,
      csrfToken: decoded.csrfToken,
    };

    if (usedCookieAuth && !SAFE_METHODS.has(req.method)) {
      const csrfHeader = req.get("x-csrf-token");
      if (!csrfHeader || csrfHeader !== decoded.csrfToken) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: "Invalid CSRF token." });
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

//Authorize Role for Admin use: role authoriation middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Access denied." });
    }
    return next();
  };
};
module.exports = {
  authenticateUser,
  authorizeRoles,
};
