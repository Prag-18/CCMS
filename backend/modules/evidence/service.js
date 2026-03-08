const evidenceRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function uploadEvidence(payload, file, actor) {
  const caseId = Number(payload.caseId);
  if (!Number.isFinite(caseId) || caseId <= 0) {
    throw createError("caseId is required", 400);
  }

  if (!file) {
    throw createError("evidence file is required", 400);
  }

  const exists = await evidenceRepository.caseExists(caseId);
  if (!exists) {
    throw createError("Case not found", 404);
  }

  const evidenceId = await evidenceRepository.createEvidence({
    caseId,
    evidenceType: payload.evidenceType || "DOCUMENT",
    description: payload.description || null,
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedByOfficerId: actor.officerId || null,
  });

  return evidenceRepository.findById(evidenceId);
}

async function getCaseEvidence(caseId) {
  const id = Number(caseId);
  if (!Number.isFinite(id) || id <= 0) {
    throw createError("Invalid case id", 400);
  }

  const items = await evidenceRepository.findByCaseId(id);
  return { items };
}

module.exports = {
  uploadEvidence,
  getCaseEvidence,
};
