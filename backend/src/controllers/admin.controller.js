const { StatusCodes } = require("http-status-codes");

exports.getAdminStatus = (req, res) => {
  return res.status(StatusCodes.OK).json({
    isAdmin: true,
    userId: req.user.id,
  });
};