const { db } = require("../../core/config/db");

async function createCase(connection, payload) {
  const sql = `
    INSERT INTO CaseFile (
      case_number,
      crime_id,
      title,
      assigned_officer_id,
      status,
      priority,
      station_id,
      created_by_officer_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [
    payload.caseNumber,
    payload.crimeId,
    payload.title,
    payload.assignedOfficerId,
    payload.status,
    payload.priority,
    payload.stationId,
    payload.createdByOfficerId,
  ]);

  return result.insertId;
}

async function addCaseActivity(connection, payload) {
  const sql = `
    INSERT INTO CaseActivity (
      case_id,
      activity_type,
      notes,
      actor_officer_id
    )
    VALUES (?, ?, ?, ?)
  `;

  await connection.execute(sql, [
    payload.caseId,
    payload.activityType,
    payload.notes,
    payload.actorOfficerId,
  ]);
}

async function findAll(filters) {
  const params = [];
  const clauses = [];

  if (filters.status) {
    clauses.push("cf.status = ?");
    params.push(filters.status);
  }

  if (filters.stationId) {
    clauses.push("cf.station_id = ?");
    params.push(Number(filters.stationId));
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  const sql = `
    SELECT
      cf.case_id AS caseId,
      cf.case_number AS caseNumber,
      cf.crime_id AS crimeId,
      cf.title,
      cf.assigned_officer_id AS assignedOfficerId,
      cf.status,
      cf.priority,
      cf.station_id AS stationId,
      cf.created_at AS createdAt,
      cf.updated_at AS updatedAt
    FROM CaseFile cf
    ${whereClause}
    ORDER BY cf.created_at DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

async function findById(caseId) {
  const sql = `
    SELECT
      case_id AS caseId,
      case_number AS caseNumber,
      crime_id AS crimeId,
      title,
      assigned_officer_id AS assignedOfficerId,
      status,
      priority,
      station_id AS stationId,
      created_at AS createdAt,
      updated_at AS updatedAt
    FROM CaseFile
    WHERE case_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [caseId]);
  return rows[0] || null;
}

async function crimeExists(crimeId) {
  const sql = `
    SELECT crime_id
    FROM Crime
    WHERE crime_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [crimeId]);
  return Boolean(rows[0]);
}

async function updateCase(connection, caseId, payload) {
  const fieldMap = {
    assignedOfficerId: "assigned_officer_id",
    status: "status",
    priority: "priority",
    title: "title",
  };

  const clauses = [];
  const params = [];

  Object.entries(fieldMap).forEach(([inputKey, column]) => {
    if (payload[inputKey] !== undefined) {
      clauses.push(`${column} = ?`);
      params.push(payload[inputKey]);
    }
  });

  if (clauses.length === 0) {
    return;
  }

  clauses.push("updated_at = NOW()");
  params.push(caseId);

  const sql = `
    UPDATE CaseFile
    SET ${clauses.join(", ")}
    WHERE case_id = ?
  `;
  await connection.execute(sql, params);
}

async function findTimeline(caseId) {
  const sql = `
    SELECT
      case_activity_id AS caseActivityId,
      case_id AS caseId,
      activity_type AS activityType,
      notes,
      actor_officer_id AS actorOfficerId,
      created_at AS createdAt
    FROM CaseActivity
    WHERE case_id = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await db.query(sql, [caseId]);
  return rows;
}

module.exports = {
  createCase,
  addCaseActivity,
  findAll,
  findById,
  crimeExists,
  updateCase,
  findTimeline,
};
