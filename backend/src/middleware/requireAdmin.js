const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.user?.id,
      is_deleted: { $in: [true, false, null] },
      is_archived: { $in: [true, false, null] },
    }).select("role is_disabled is_deleted deleted_at");
    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "No user is authenticated.",
        code: "SESSION_INVALIDATED",
      });
    }
    if (user.is_disabled) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "This account has been banned or disabled.",
        code: "ACCOUNT_DISABLED",
      });
    }
    if (user.is_deleted || user.deleted_at) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "This account is scheduled for deletion.",
        code: "ACCOUNT_DELETED",
      });
    }
    if (user.role !== "admin") {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required." });
    }

    req.user.role = user.role;
    return next();
  } catch (error) {
    return next(error);
  }
};
