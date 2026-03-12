const crimeRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function mapPersistenceError(error) {
  if (!error) {
    return createError("Internal server error", 500);
  }

  // MySQL foreign-key violation.
  if (error.code === "ER_NO_REFERENCED_ROW_2" || error.errno === 1452) {
    const message = String(error.message || "");
    if (message.includes("`location_id`")) {
      return createError("location_id does not exist", 400);
    }
    if (message.includes("`reported_by`")) {
      return createError("Authenticated officer does not exist", 401);
    }
    return createError("Invalid related reference in request", 400);
  }

  return error;
}

async function registerCrime(payload) {
  const crimePayload = {
    crime_type: String(payload.crime_type || "").trim(),
    description: String(payload.description || "").trim(),
    location_id: Number(payload.location_id),
    reported_by: Number(payload.reported_by),
  };

  if (!crimePayload.crime_type) {
    throw createError("crime_type is required", 400);
  }

  if (!crimePayload.description) {
    throw createError("description is required", 400);
  }

  if (!Number.isInteger(crimePayload.location_id) || crimePayload.location_id <= 0) {
    throw createError("location_id must be a positive integer", 400);
  }

  if (!Number.isInteger(crimePayload.reported_by) || crimePayload.reported_by <= 0) {
    throw createError("reported_by must be a positive integer", 400);
  }

  let crimeId;
  try {
    crimeId = await crimeRepository.createCrime(crimePayload);
  } catch (error) {
    throw mapPersistenceError(error);
  }

  return crimeRepository.getCrimeById(crimeId);
}

async function fetchAllCrimes() {
  return crimeRepository.getAllCrimes();
}

async function fetchCrimeById(crimeId) {
  const id = Number(crimeId);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError("Invalid crime id", 400);
  }

  const crime = await crimeRepository.getCrimeById(id);
  if (!crime) {
    throw createError("Crime not found", 404);
  }

  return crime;
}

async function modifyCrime(crimeId, payload) {
  const id = Number(crimeId);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError("Invalid crime id", 400);
  }

  const updateData = {};

  if (payload.crime_type !== undefined) {
    const value = String(payload.crime_type).trim();
    if (!value) {
      throw createError("crime_type cannot be empty", 400);
    }
    updateData.crime_type = value;
  }

  if (payload.description !== undefined) {
    const value = String(payload.description).trim();
    if (!value) {
      throw createError("description cannot be empty", 400);
    }
    updateData.description = value;
  }

  if (payload.location_id !== undefined) {
    const value = Number(payload.location_id);
    if (!Number.isInteger(value) || value <= 0) {
      throw createError("location_id must be a positive integer", 400);
    }
    updateData.location_id = value;
  }

  if (payload.reported_by !== undefined) {
    const value = Number(payload.reported_by);
    if (!Number.isInteger(value) || value <= 0) {
      throw createError("reported_by must be a positive integer", 400);
    }
    updateData.reported_by = value;
  }

  if (Object.keys(updateData).length === 0) {
    throw createError("At least one field is required to update", 400);
  }

  let updated;
  try {
    updated = await crimeRepository.updateCrime(id, updateData);
  } catch (error) {
    throw mapPersistenceError(error);
  }

  if (!updated) {
    throw createError("Crime not found", 404);
  }

  return crimeRepository.getCrimeById(id);
}

module.exports = {
  registerCrime,
  fetchAllCrimes,
  fetchCrimeById,
  modifyCrime,
};
