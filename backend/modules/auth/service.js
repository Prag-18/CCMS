const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../../core/config/env");
const authRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function login(credentials) {
  const identifier = String(
    credentials.identifier || credentials.email || credentials.badgeNumber || ""
  ).trim();
  const password = String(credentials.password || "");

  if (!identifier || !password) {
    throw createError("identifier and password are required", 400);
  }

  const officer = await authRepository.findOfficerByIdentifier(identifier);
  if (!officer) {
    throw createError("Invalid credentials", 401);
  }

  if (officer.isActive === 0) {
    throw createError("Officer account is inactive", 403);
  }

  const validPassword = await bcrypt.compare(password, officer.passwordHash || "");
  if (!validPassword) {
    throw createError("Invalid credentials", 401);
  }

  const tokenPayload = {
    officerId: officer.officerId,
    role: officer.role,
    stationId: officer.stationId,
    fullName: officer.fullName,
  };

  const accessToken = jwt.sign(tokenPayload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  await authRepository.updateLastLogin(officer.officerId);

  return {
    accessToken,
    tokenType: "Bearer",
    expiresIn: env.jwtExpiresIn,
    officer: {
      officerId: officer.officerId,
      fullName: officer.fullName,
      email: officer.email,
      badgeNumber: officer.badgeNumber,
      role: officer.role,
      stationId: officer.stationId,
    },
  };
}

module.exports = {
  login,
};
