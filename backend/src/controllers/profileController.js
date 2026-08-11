const User = require("../models/user");
const UserProgress = require("../models/UserProgress");
const { StatusCodes } = require("http-status-codes");

//Get first initial from  name from user model or email
const getFirstInitial = (name, email) => {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase();
};
// Connect to profileRoutes.js
//GET /api/v1/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user || user.is_deleted) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Not authenticated or account deactivated." });
    }
    const progress = await UserProgress.findOne({ user_id: req.user.id });
    return res.status(StatusCodes.OK).json({
      name: user.name,
      email: user.email,
      avatar_initial: getFirstInitial(user.name, user.email),
      current_lesson: progress?.current_micro_lesson_id || "Lesson 1",
      badges: progress?.earned_badges || [],
    });
  } catch (error) {
    return next(error);
  }
};

//PATCH /api/v1/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      updates.email = email;
      updates.email_verified_at = null;
    }
    if (Object.keys(updates).length === 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No Valid fields provided for update." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updates,
      },
      { new: true, runValidators: true },
    ).select("-password_hash");
    if (!updatedUser || updatedUser.is_deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }
    return res.status(StatusCodes.OK).json({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar_initial: getFirstInitial(updatedUser.name, updatedUser.email),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Email is unavailable." });
    }
    return next(error);
  }
};
//DELETE /api/v1/profile
const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: { is_deleted: true, deleted_at: new Date() },
        $inc: { token_version: 1 },
      },
      {
        new: true,
      },
    );
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found." });
    }
    res.clearCookie("session_token");
    return res
      .status(StatusCodes.OK)
      .json({ message: "Account has been deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFirstInitial,
  getProfile,
  updateProfile,
  deleteAccount,
};
