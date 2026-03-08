const { withTransaction } = require("../../core/config/db");
const caseRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateCaseNumber() {
  const timestamp = Date.now();
  return `CASE-${timestamp}`;
}

async function createCase(payload, actor) {
  const crimeId = Number(payload.crimeId);
  if (!Number.isFinite(crimeId) || crimeId <= 0) {
    throw createError("crimeId is required", 400);
  }

  const data = {
    caseNumber: payload.caseNumber || generateCaseNumber(),
    crimeId,
    title: payload.title || "Untitled Case",
    assignedOfficerId: payload.assignedOfficerId || actor.officerId || null,
    status: payload.status || "OPEN",
    priority: payload.priority || "MEDIUM",
    stationId: payload.stationId || actor.stationId || null,
    createdByOfficerId: actor.officerId || null,
  };

  const caseId = await withTransaction(async (connection) => {
    const id = await caseRepository.createCase(connection, data);
    await caseRepository.addCaseActivity(connection, {
      caseId: id,
      activityType: "CASE_CREATED",
      notes: payload.activityNote || "Case created",
      actorOfficerId: actor.officerId || null,
    });
    return id;
  });

  const created = await caseRepository.findById(caseId);
  const timeline = await caseRepository.findTimeline(caseId);
  return { ...created, timeline };
}

async function getCases(filters) {
  const items = await caseRepository.findAll(filters);
  return { items };
}

async function updateCase(caseId, payload, actor) {
  const id = Number(caseId);
  if (!Number.isFinite(id) || id <= 0) {
    throw createError("Invalid case id", 400);
  }

  const existing = await caseRepository.findById(id);
  if (!existing) {
    throw createError("Case not found", 404);
  }

  await withTransaction(async (connection) => {
    await caseRepository.updateCase(connection, id, {
      title: payload.title,
      assignedOfficerId: payload.assignedOfficerId,
      status: payload.status,
      priority: payload.priority,
    });

    await caseRepository.addCaseActivity(connection, {
      caseId: id,
      activityType: "CASE_UPDATED",
      notes: payload.activityNote || "Case updated",
      actorOfficerId: actor.officerId || null,
    });
  });

  const updated = await caseRepository.findById(id);
  const timeline = await caseRepository.findTimeline(id);
  return { ...updated, timeline };
}

module.exports = {
  createCase,
  getCases,
  updateCase,
};
