const { User, ArchivedUser } = require("../models/user");
const UserProgress = require("../models/UserProgress");
const { StatusCodes } = require("http-status-codes");
const { comparePassword, hashPassword } = require("../utils/password");

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

    const progress = await UserProgress.findOne({ user_id: req.user.id }).sort({
      updated_at: -1,
    });
    return res.status(StatusCodes.OK).json({
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url || null, // this is so front end will use first initial of user
      avatar_initial: getFirstInitial(user.name, user.email),
      current_lesson: progress?.current_micro_lesson_id || "Lesson 1",
      badges: progress?.earned_badges || [],
    });
  } catch (error) {
    return next(error);
  }
};
//POST /api/v1/profile/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.is_deleted) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "No User found." });
    }
    // check if filed uploaded was a url string
    const uploadedUrl = req.file?.path || req.body?.avatar_url || null;
    user.avatar_url = uploadedUrl;
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: user.avatar_url ? "Avatar uploaded." : "Avatar set to default initial.",
      avatar_url: user.avatar_url,
      avatar_initial: getFirstInitial(user.name, user.email),
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
      avatar_url: updatedUser.avatar_url || null,
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
//POST /api/v1/profile/password (uS 2.4.7)
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Both the current and new passwords are needed." });
    }
    const user = await User.findById(req.user.id).select("+password_hash");
    if (!user || user.is_deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found or account has been deleted." });
    }
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Current password is not correct." });
    }
    user.password_hash = await hashPassword(newPassword);
    user.token_version = (user.token_version || 0) + 1; //invalidates active jwt on other devices
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
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
    await ArchivedUser.create({
      original_user_id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      deleted_at: new Date(),
    });
    res.clearCookie("session_token", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
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
  changePassword,
  deleteAccount,
  uploadAvatar,
};
