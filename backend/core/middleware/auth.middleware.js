const jwt = require("jsonwebtoken");
const env = require("../config/env");

function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    const error = new Error("Unauthorized");
    error.statusCode = 401;
    return next(error);
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (_error) {
    const error = new Error("Invalid or expired token");
    error.statusCode = 401;
    return next(error);
  }
}

module.exports = authMiddleware;
