const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(
    "Internal server error: ",
    err.constructor.name,
    JSON.stringify(err, ["name", "message", "stack"]),
  );

  if (err.name === "MongooseServerSelectionError") {
    console.error("Couldn't connect to the database. Is it running?");
  }
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((item) => item.message);
    if (!res.headersSent) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Validation error",
        errors: messages,
      });
    }
  }
  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    if (!res.headersSent) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: `Invalid value for ${err.path || "identifier"}.`,
        field: err.path,
      });
    }
  }
  if (err.type === "entity.parse.failed") {
    if (!res.headersSent) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Malformed JSON request body.",
      });
    }
  }
  //if the email already exists in the database
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    if (!res.headersSent) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ message: `${field ? field : "Field"} already exists.` });
    }
  }
  if (!res.headersSent) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "An internal server error occurred." });
  }
};

module.exports = errorHandlerMiddleware;
