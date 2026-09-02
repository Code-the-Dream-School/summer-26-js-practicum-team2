const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

const JWT_SECRET = process.env.JWT_SECRET || "do_not_forget_to_set_a_secret_here";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const send401 = (res, { message = "No user is authenticated.", code } = {}) => {
  return res.status(StatusCodes.UNAUTHORIZED).json({
    message,
    ...(code ? { code } : {}),
  });
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
    const user = await User.findOne({
      _id: decoded.id,
      is_deleted: { $in: [true, false, null] },
      is_archived: { $in: [true, false, null] },
    }).select("role is_disabled is_deleted deleted_at token_version");
    const tokenVersionInJwt = decoded.token_version ?? 0;
    if (!user || user.token_version !== tokenVersionInJwt) {
      return send401(res, { code: "SESSION_INVALIDATED" });
    }

    if (user.is_disabled) {
      res.clearCookie("session_token", { httpOnly: true, sameSite: "lax", path: "/" });
      return send401(res, {
        message: "This account has been banned or disabled.",
        code: "ACCOUNT_DISABLED",
      });
    }

    if (user.is_deleted || user.deleted_at) {
      res.clearCookie("session_token", { httpOnly: true, sameSite: "lax", path: "/" });
      return send401(res, {
        message: "This account is scheduled for deletion.",
        code: "ACCOUNT_DELETED",
      });
    }

    req.user = {
      id: user._id,
      role: user.role,
      csrfToken: decoded.csrfToken,
    };

    if (usedCookieAuth && !SAFE_METHODS.has(req.method)) {
      const csrfHeader = req.get("x-csrf-token");
      if (!csrfHeader || csrfHeader !== decoded.csrfToken) {
        res.set("X-CSRF-TOKEN", decoded.csrfToken);
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
