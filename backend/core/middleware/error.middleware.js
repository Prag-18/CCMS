const logger = require("../utils/logger");
const { fail } = require("../utils/response");

function notFoundMiddleware(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  return next(error);
}

function errorMiddleware(err, req, res, _next) {
  const multerLikeError = err.name === "MulterError";
  const statusCode = err.statusCode || (multerLikeError ? 400 : 500);
  const message = statusCode === 500 ? "Internal server error" : err.message;

  logger.error("Request failed", {
    statusCode,
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  return fail(res, {
    statusCode,
    message,
    errors: err.details,
  });
}

module.exports = {
  notFoundMiddleware,
  errorMiddleware,
};
