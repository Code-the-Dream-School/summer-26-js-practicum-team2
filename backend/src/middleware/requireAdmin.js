const { StatusCodes } = require("http-status-codes");

module.exports = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ message: "Admin access required." });
  }

  return next();
};
