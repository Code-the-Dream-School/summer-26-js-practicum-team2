const { User, ArchivedUser } = require("../models/User.model");
const UserProgress = require("../models/UserProgress.model");
const { StatusCodes } = require("http-status-codes");
const { comparePassword, hashPassword } = require("../utils/password");
const {
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
} = require("../validation/profileValidation");
const { getUserXpTotal } = require("../services/xp.service");

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

    const xpTotal = await getUserXpTotal(req.user.id);

    return res.status(StatusCodes.OK).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goals: user.goals ?? "",
        theme: user.theme ?? "Light",
        notifications: user.notifications ?? true,
        xp: xpTotal,
        streak: user.streak ?? 0,
        avatar_url: user.avatar_url || null,
        avatar_initial: getFirstInitial(user.name, user.email),
        current_lesson: progress?.current_micro_lesson_id || "Lesson 1",
        badges: progress?.earned_badges || [],
      },
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
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No User found." });
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
    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        error: error.details.map((detail) => detail.message),
      });
    }
    const { name, email, goals, theme, notifications } = value;
    const user = await User.findById(req.user.id);

    if (!user || user.is_deleted) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: " User not found or user deleted account. " });
    }

    const xpTotal = await getUserXpTotal(req.user.id);
    
    let hasUpdates = false;
    if (name !== undefined) {
      user.name = name;
      hasUpdates = true;
    }
    if (goals !== undefined) {
      user.goals = goals;
      hasUpdates = true;
    }
    if (theme !== undefined) {
      user.theme = theme;
      hasUpdates = true;
    }
    if (notifications !== undefined) {
      user.notifications = notifications;
      hasUpdates = true;
    }
    // Email changed
    if (email !== undefined && email !== user.email) {
      user.email = email;
      user.email_verified_at = null;
      hasUpdates = true;
    }
    if (!hasUpdates) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No items requested to be updated." });
    }
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: "You have successfully updated your profile.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        goals: user.goals,
        theme: user.theme,
        notifications: user.notifications,
        xp: xpTotal,
        streak: user.streak ?? 0,
        avatar_url: user.avatar_url || null,
        avatar_initial: getFirstInitial(user.name, user.email),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Email is not able to be used. " });
    }
    return next(error);
  }
};
/* const user = await User.findById(req.user.id);
  if (!user || user.is_deleted) {
    return res.status(StatusCodes.NOT_FOUND).json({message: " User not found. "});
  } 
  if (name !== undefined) user.name = name;
  if (goals != undefined) user.goals = goals;
  if (theme !== undefined) user.theme = theme;
  if (notifications !== undefined) user.notifications = notifications;


  await user.save();
  return res.status(StatusCodes.OK).json({
    message: "Profile updated with succeess.",
   
  });
} catch (error) {
  return next (error);
}
  try { 
    const { name, email, goals, theme, notifications } = req.body;
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
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    return res.status(StatusCodes.OK).json({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar_url: updatedUser.avatar_url || null,
      avatar_initial: getFirstInitial(updatedUser.name, updatedUser.email),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({ message: "Email is unavailable." });
    }
    return next(error);
  }
}; REMOVED Aug 13*/
//POST /api/v1/profile/password (uS 2.4.7)
const changePassword = async (req, res, next) => {
  try {
    //Validate password input using changePasswordSchema

    const { error, value } = changePasswordSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error with validation",
        errors: error.details.map((detail) => detail.message),
      });
    }
    //const { currentPassword, newPassword } = req.body;
    //if (!currentPassword || !newPassword) {
    //return res
    // .status(StatusCodes.BAD_REQUEST)
    // .json({ message: "Both the current and new passwords are needed." });
    //}
    const { currentPassword, newPassword } = value;
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

//DELETE /api/v1/profile for soft deletion. items deleted are kept for 30 days in case user wants to reactivate
const deleteAccount = async (req, res, next) => {
  try {
    const { error, value } = deleteAccountSchema.validate(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: error.details[0].message,
      });
    }
    const user = await User.findById(req.user.id);
    if (!user || user.is_deleted) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found." });
    }
    if (user.email.toLocaleLowerCase() !== value.email.toLowerCase()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Email does not match account email on record. Please try again.",
      });
    }
    user.is_deleted = true;
    user.deleted_at = new Date();
    user.token_version = (user.token_version || 0) + 1;
    await user.save();

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
    return res.status(StatusCodes.OK).json({ message: "Account has been deleted successfully." });
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
