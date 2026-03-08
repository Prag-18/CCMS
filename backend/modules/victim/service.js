const { withTransaction } = require("../../core/config/db");
const victimRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createVictim(payload) {
  const fullName = String(payload.fullName || "").trim();
  if (!fullName) {
    throw createError("fullName is required", 400);
  }

  const crimeId = payload.crimeId ? Number(payload.crimeId) : null;

  const victimId = await withTransaction(async (connection) => {
    const id = await victimRepository.createVictim(connection, {
      fullName,
      contactNumber: payload.contactNumber || null,
      address: payload.address || null,
      age: payload.age || null,
      gender: payload.gender || null,
    });

    if (crimeId && crimeId > 0) {
      await victimRepository.linkVictimToCrime(connection, id, crimeId);
    }

    return id;
  });

  return victimRepository.findById(victimId);
}

async function getVictims() {
  const items = await victimRepository.findAll();
  return { items };
}

module.exports = {
  createVictim,
  getVictims,
};
