const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("../../core/config/env");
const repository = require("./repository");

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function throwMissingFieldsError(fields, data) {
  const error = createHttpError(400, `Missing required field(s): ${fields.join(", ")}`);
  error.details = {
    missingFields: fields,
    receivedKeys: Object.keys(data || {}),
    hint: "Send a JSON body with Content-Type: application/json",
  };
  throw error;
}

async function registerOfficer(data = {}) {
  try {
    const name = normalizeText(data.name);
    const email = normalizeText(data.email).toLowerCase();
    const password = normalizeText(data.password);
    const role = normalizeText(data.role);

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (!role) missingFields.push("role");

    if (missingFields.length > 0) {
      throwMissingFieldsError(missingFields, data);
    }

    const existing = await repository.findOfficerByEmail(email);

    if (existing) {
      throw createHttpError(409, "Officer already exists");
    }

    const hashedPassword = password; // DEV: plain text, no hashing

    const officerId = await repository.createOfficer({
      name,
      email,
      password_hash: hashedPassword,
      role,
    });

    return { officerId };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

async function loginOfficer(data = {}) {
  try {
    const email = normalizeText(data.email).toLowerCase();
    const password = normalizeText(data.password);

    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      throwMissingFieldsError(missingFields, data);
    }

    const officer = await repository.findOfficerByEmail(email);

    if (!officer || !officer.password_hash) {
      throw createHttpError(401, "Invalid email or password");
    }

    // DEV: plain text comparison (no bcrypt)
    const validPassword = password === officer.password_hash;

    if (!validPassword) {
      throw createHttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
      {
        officer_id: officer.officer_id,
        role: officer.role,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return {
      token,
      officer: {
        id: officer.officer_id,
        name: officer.name,
        role: officer.role,
      },
    };
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

async function fetchOfficers() {
  return repository.findAllOfficers();
}

async function hasRegisteredOfficers() {
  const total = await repository.countOfficers();
  return total > 0;
}

module.exports = {
  registerOfficer,
  loginOfficer,
  fetchOfficers,
  hasRegisteredOfficers,
};
