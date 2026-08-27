const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

//get all users that are admin
const getAllAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "admin" }).select(
      "-password -resetPasswordToken -csrfToken",
    );
    return res.status(StatusCodes.OK).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    return next(error);
  }
};

//pending deletions infor re: all of the pending deletions from all users requesting to delete acct
const getPendingDeleteAccount = async (req, res, next) => {
  try {
    const pendingDelRequests = await User.find({
      deletion_status: "pending",
    }).select("name email deletion_status deletion_requested_at created_at"); //select the fields from the user table
    return res.status(StatusCodes.OK).json({
      success: true,
      count: pendingDelRequests.length,
      users: pendingDelRequests,
    });
  } catch (err) {
    return next(err);
  }
};
//2. approve deletion request
const approveDeleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    //must use find
    const updatedUser = await User.findOneAndUpdate(
      //{ _id: userId, is_deleted: { $in: [true, false] } },
      { _id: userId },

      {
        deletion_status: "approved",
        deleted_at: new Date(),
        is_deleted: true,
        deletion_approved_by: req.user.id || req.user._id,
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No user found." });
    }
    return res.status(StatusCodes.OK).json({
      message: "Account has been approved for deletion.",
      user: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};
const rejectDeleteAccount = async (req, res, next) => {
  try {
    const { userId } = req.params;
    //const updatedUser = await User.findByIdAndUpdate(
    const updatedUser = await User.findOneAndUpdate(
      // { _id: userId, is_deleted: { $in: [true, false] } },
      { _id: userId },

      {
        deletion_status: "denied",
        is_deleted: false,
        deletion_requested_at: null,
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No user found." });
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: " Account request for deletion rejected.", user: updatedUser });
  } catch (err) {
    return next(err);
  }
};
// reactivate user account

const reactivateUserAcct = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "No User is found." });
    }
    if (!user.is_archived || !user.deleted_at) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "This user account is not archived.",
      });
    }
    //30 day grace period
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const activeGracePeriod = Date.now() - new Date(user.deleted_at).getTime() <= THIRTY_DAYS_MS;
    if (!activeGracePeriod) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Grace period to reactivate account has expired. Please register again.",
      });
    }
    //reset flags with reactivation
    user.is_archived = false;
    user.deletion_status = "none";
    user.is_deleted = false;
    user.deletion_requested_at = null;
    user.deleted_at = null;
    await user.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "User account has been reactivated.",
    });
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  getAllAdminUsers,
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
  reactivateUserAcct,
};
