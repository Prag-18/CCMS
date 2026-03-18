const { query } = require("../../core/config/db");

async function caseExists(caseId) {
  const sql = "SELECT case_id AS caseId FROM CaseFile WHERE case_id = ? LIMIT 1";
  const [rows] = await query(sql, [caseId]);
  return Boolean(rows[0]);
}

async function createEvidence(payload) {
  const sql = `
    INSERT INTO Evidence (
      case_id,
      evidence_type,
      description,
      file_name,
      file_path,
      mime_type,
      file_size,
      uploaded_by_officer_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await query(sql, [
    payload.caseId,
    payload.evidenceType,
    payload.description,
    payload.fileName,
    payload.filePath,
    payload.mimeType,
    payload.fileSize,
    payload.uploadedByOfficerId,
  ]);

  return result.insertId;
}

async function findById(evidenceId) {
  const sql = `
    SELECT
      evidence_id AS evidenceId,
      case_id AS caseId,
      evidence_type AS evidenceType,
      description,
      file_name AS fileName,
      file_path AS filePath,
      mime_type AS mimeType,
      file_size AS fileSize,
      uploaded_by_officer_id AS uploadedByOfficerId,
      created_at AS createdAt
    FROM Evidence
    WHERE evidence_id = ?
    LIMIT 1
  `;
  const [rows] = await query(sql, [evidenceId]);
  return rows[0] || null;
}

async function findByCaseId(caseId) {
  const sql = `
    SELECT
      evidence_id AS evidenceId,
      case_id AS caseId,
      evidence_type AS evidenceType,
      description,
      file_name AS fileName,
      file_path AS filePath,
      mime_type AS mimeType,
      file_size AS fileSize,
      uploaded_by_officer_id AS uploadedByOfficerId,
      created_at AS createdAt
    FROM Evidence
    WHERE case_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await query(sql, [caseId]);
  return rows;
}

async function findAll() {
  const sql = `
    SELECT
      evidence_id AS evidenceId,
      case_id AS caseId,
      evidence_type AS evidenceType,
      description,
      file_name AS fileName,
      file_path AS filePath,
      mime_type AS mimeType,
      file_size AS fileSize,
      uploaded_by_officer_id AS uploadedByOfficerId,
      created_at AS createdAt
    FROM Evidence
    ORDER BY created_at DESC
  `;

  const [rows] = await query(sql);
  return rows;
}

module.exports = {
  caseExists,
  createEvidence,
  findById,
  findByCaseId,
  findAll,
};
