const AppError = require("../utils/appError");

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForPod = (err, res) => {
  // Operational, trusted error: Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Pogramming or other unknown error: don't leak error details to the client
  } else {
    // 1)Log error
    console.error("Error ", err);
    // 2) Send generic message
    res.status(err.statusCode).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateIdDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = () => {
  const errors = Object.values(err.errors).map((er) => er.message);

  const message = `Invalid Input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = {...err};

    if (error.name === "CastError") erorr = handleCastErrorDB(erorr);
    if (error.code === 11000) error = handleDuplicateIdDB(error);
    if (error.name === "ValidationError") {
      error = handleValidationErrorDB(error);
    }

    sendErrorForPod(error, res);
  }
};
