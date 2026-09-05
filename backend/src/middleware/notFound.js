const { StatusCodes } = require("http-status-codes");

const notFoundMiddleware = (req, res) =>
  res.status(StatusCodes.NOT_FOUND).json({
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });

module.exports = notFoundMiddleware;
