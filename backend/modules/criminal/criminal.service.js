const criminalRepository = require("./criminal.repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createCriminal(payload) {
  const fullName = String(payload.fullName || "").trim();
  if (!fullName) {
    throw createError("fullName is required", 400);
  }

  const criminalId = await criminalRepository.createCriminal({
    fullName,
    aliasName: payload.aliasName || null,
    age: payload.age || null,
    gender: payload.gender || null,
    notes: payload.notes || null,
  });

  return criminalRepository.findById(criminalId);
}

async function getCriminals(includeHistory = false) {
  const items = await criminalRepository.findAll();

  if (!includeHistory) {
    return { items };
  }

  const withHistory = await Promise.all(
    items.map(async (criminal) => {
      const history = await criminalRepository.findHistoryByCriminalId(criminal.criminalId);
      return { ...criminal, history };
    })
  );

  return { items: withHistory };
}

module.exports = {
  createCriminal,
  getCriminals,
};
