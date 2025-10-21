const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  // Handle known Mongoose + operational errors
  if (err.name === "CastError") {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  } else if (err.code === 11000) {
    err = new AppError(
      `Duplicate field value: ${JSON.stringify(err.keyValue)}`,
      400
    );
  } else if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    err = new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
  }

  // If it's not from AppError, make it generic
  if (!(err instanceof AppError)) {
    console.error("💥 Unexpected Error:", err);
    err = new AppError("Something went wrong on the server", 500);
  }

  //  Send clean response to the client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  //  Hide details for unknown errors
  console.error("💥 UNEXPECTED ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong! Our team has been notified.",
  });
};

module.exports = errorHandler;
