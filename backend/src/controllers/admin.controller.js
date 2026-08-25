const { StatusCodes } = require("http-status-codes");
const User = require("../models/User.model");

//pending deletions infor re: all of the pending deletions from all users requesting to delete acct
const getPendingDeleteAccount = async (req, res, next) => {
  try {
    const pendingDelRequests = await User.find({
      deletion_status: "pending",
    }).select("name email deletion_status deletion_requested_at created_at"); //select the fields from the user table
    return res.status(StatusCodes.OK).json({
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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        deletion_status: "approved",
        deleted_at: new Date(),
        is_deleted: true,
        deletion_approved_by: req.user.id,
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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        deletion_status: "denied",
        is_deleted: false,
        deletion_requested_at: null,
      },
      { new: true },
    );
    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: " No user found." });
    }
    return res
      .status(StatusCodes.OK)
      .json({ message: " Account request for deletion rejected.", user: updatedUser });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getPendingDeleteAccount,
  approveDeleteAccount,
  rejectDeleteAccount,
};
