const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id).select("role is_disabled deleted_at");
    if (!user || user.role !== "admin" || user.is_disabled || user.deleted_at) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required." });
    }

    req.user.role = user.role;
    return next();
  } catch (error) {
    return next(error);
  }
};
