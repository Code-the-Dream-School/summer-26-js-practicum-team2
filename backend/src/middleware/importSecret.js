const { StatusCodes } = require("http-status-codes");

module.exports = (req, res, next) => {
  const configuredSecret = process.env.LESSON_IMPORT_SECRET;
  if (!configuredSecret) {
    return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      message: "Lesson import is not configured.",
    });
  }

  if (req.get("x-import-secret") !== configuredSecret) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid lesson import secret.",
    });
  }

  return next();
};
