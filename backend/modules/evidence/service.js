const evidenceRepository = require("./repository");
const caseRepository = require("../case/repository");
const notificationService = require("../notification/service");

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
    uploadedByOfficerId: actor.officer_id || actor.officerId || null,
  });

  const actorOfficerId = actor.officer_id || actor.officerId || null;
  if (actorOfficerId) {
    try {
      await caseRepository.addCaseActivityEntry({
        caseId,
        activityType: "EVIDENCE_UPLOADED",
        notes: payload.activityNote || `Evidence uploaded: ${file.originalname}`,
        actorOfficerId,
      });
    } catch {
      // Best effort logging to keep evidence upload resilient.
    }
  }

  try {
    const caseDetails = await caseRepository.findById(caseId);
    await notificationService.notifyOfficer(
      caseDetails && caseDetails.assignedOfficerId,
      `Evidence uploaded for ${caseDetails?.caseNumber || `case #${caseId}`}`
    );
  } catch {
    // Best effort notification.
  }

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

async function getEvidence() {
  const items = await evidenceRepository.findAll();
  return { items };
}

module.exports = {
  uploadEvidence,
  getCaseEvidence,
  getEvidence,
};
