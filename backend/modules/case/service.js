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

function resolveActorOfficerId(actor = {}) {
  const officerId = Number(actor.officer_id);
  return Number.isFinite(officerId) && officerId > 0 ? officerId : null;
}

function mapPersistenceError(error) {
  if (!error) {
    return createError("Internal server error", 500);
  }

  // MySQL foreign-key violation.
  if (error.code === "ER_NO_REFERENCED_ROW_2" || error.errno === 1452) {
    const message = String(error.message || "");
    if (message.includes("`crime_id`")) {
      return createError("crimeId does not exist", 400);
    }
    if (message.includes("`assigned_officer_id`") || message.includes("`created_by_officer_id`")) {
      return createError("Authenticated officer does not exist", 401);
    }
    if (message.includes("`station_id`")) {
      return createError("stationId does not exist", 400);
    }
    return createError("Invalid related reference in request", 400);
  }

  return error;
}

async function createCase(payload, actor) {
  const actorOfficerId = resolveActorOfficerId(actor);
  if (!actorOfficerId) {
    throw createError("Authenticated officer is required", 401);
  }

  const crimeId = Number(payload.crimeId);
  if (!Number.isFinite(crimeId) || crimeId <= 0) {
    throw createError("crimeId is required", 400);
  }

  const crimeExists = await caseRepository.crimeExists(crimeId);
  if (!crimeExists) {
    throw createError("crimeId does not exist", 400);
  }

  const data = {
    caseNumber: generateCaseNumber(),
    crimeId,
    title: payload.title || "Untitled Case",
    assignedOfficerId: actorOfficerId,
    status: payload.status || "OPEN",
    priority: payload.priority || "MEDIUM",
    stationId: payload.stationId || null,
    createdByOfficerId: actorOfficerId,
  };

  let caseId;
  try {
    caseId = await withTransaction(async (connection) => {
      const id = await caseRepository.createCase(connection, data);
      await caseRepository.addCaseActivity(connection, {
        caseId: id,
        activityType: "CASE_CREATED",
        notes: payload.activityNote || "Case created",
        actorOfficerId,
      });
      return id;
    });
  } catch (error) {
    throw mapPersistenceError(error);
  }

  const created = await caseRepository.findById(caseId);
  const timeline = await caseRepository.findTimeline(caseId);
  return { ...created, timeline };
}

async function getCases(filters) {
  const items = await caseRepository.findAll(filters);
  return { items };
}

async function getCaseById(caseId) {
  const id = Number(caseId);
  if (!Number.isFinite(id) || id <= 0) {
    throw createError("Invalid case id", 400);
  }

  const existing = await caseRepository.findById(id);
  if (!existing) {
    throw createError("Case not found", 404);
  }

  const timeline = await caseRepository.findTimeline(id);
  return { ...existing, timeline };
}

async function getTimeline(caseId) {
  const id = Number(caseId);
  if (!Number.isFinite(id) || id <= 0) {
    throw createError("Invalid case id", 400);
  }

  return caseRepository.findTimeline(id);
}

async function getRecentTimeline(limit) {
  return caseRepository.findRecentTimeline(limit);
}

async function updateCase(caseId, payload, actor) {
  const actorOfficerId = resolveActorOfficerId(actor);

  const id = Number(caseId);
  if (!Number.isFinite(id) || id <= 0) {
    throw createError("Invalid case id", 400);
  }

  const existing = await caseRepository.findById(id);
  if (!existing) {
    throw createError("Case not found", 404);
  }

  try {
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
        actorOfficerId,
      });
    });
  } catch (error) {
    throw mapPersistenceError(error);
  }

  const updated = await caseRepository.findById(id);
  const timeline = await caseRepository.findTimeline(id);
  return { ...updated, timeline };
}

module.exports = {
  createCase,
  getCases,
  getCaseById,
  getTimeline,
  getRecentTimeline,
  updateCase,
};
