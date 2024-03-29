const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  //Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. invalid : ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Momgoose duplicate Key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT error
  if (err.name === "jsonwebTokenError") {
    const message = `Token is invalid, Try again`;
    err = new ErrorHandler(message, 400);
  }
  //JWT Expire error
  if (err.name === "TokenExpiredError") {
    const message = `Token is Expired, Try again`;
    err = new ErrorHandler(message, 403);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
