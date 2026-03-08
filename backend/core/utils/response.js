function success(res, { statusCode = 200, message = "OK", data = null, meta } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: meta || undefined,
  });
}

function fail(res, { statusCode = 500, message = "Internal server error", errors } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
  });
}

module.exports = {
  success,
  fail,
};
