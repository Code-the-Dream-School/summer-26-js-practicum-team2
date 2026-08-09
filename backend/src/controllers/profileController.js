const User = require("../models/User");
const UserProgress = require("../models/UserProgress");
const { StatusCodes } = require ("http-status-codes");

//Get first initial from  name from user model or email 
const getFirstInitial = (name, email) => {
  const source = name?.trim() || email?.trim() || "?";
  return source.charAt(0).toUpperCase(); 
};
// Connect to profileRoutes.js
//GET /api/v1/profile 
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash"); 
    if(!user || user.is_deleted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authenticated or account deactivated." });
    }
    const progress = await UserProgress.findOne({ user_id: req.user.id });
    return res.status(StatusCodes.OK).json({
      name: user.name,
      email: user.email,
      avatar_initial: getFirstInitial(user.name, user.email),
      current_lesson: progress?.current_micro_lesson_id || "Lesson 1",
      badges: progress?.badges || [],
    }
    );
  }catch (error) {
    return next(error);
  }
};

//PATCH /api/v1/profile 
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
     if (name!== undefined) updates.name = name;
     if (email!== undefined) updates.email = email;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      {
        $set: updates},
        {new: true, runValidators: true 
      }).select("-password_hash");
      return res.status(StatusCodes.OK).json({
        name: updatedUser.name,
        email: updatedUser.email,
        avatar_initial: getFirstInitial(updatedUser.name, updatedUser.email),
      });
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({message: error.message});
    }
  };
