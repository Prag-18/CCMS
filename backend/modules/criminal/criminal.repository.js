const { db } = require("../../core/config/db");

async function createCriminal(payload) {
  const sql = `
    INSERT INTO Criminal (
      full_name,
      alias_name,
      age,
      gender,
      notes
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    payload.fullName,
    payload.aliasName,
    payload.age,
    payload.gender,
    payload.notes,
  ]);

  return result.insertId;
}

async function findAll() {
  const sql = `
    SELECT
      criminal_id AS criminalId,
      full_name AS fullName,
      alias_name AS aliasName,
      age,
      gender,
      notes,
      created_at AS createdAt
    FROM Criminal
    ORDER BY created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

async function findHistoryByCriminalId(criminalId) {
  const sql = `
    SELECT
      c.crime_id AS crimeId,
      c.title,
      c.crime_type AS crimeType,
      c.status,
      c.reported_at AS reportedAt
    FROM CrimeCriminal cc
    JOIN Crime c ON c.crime_id = cc.crime_id
    WHERE cc.criminal_id = ?
    ORDER BY c.reported_at DESC
  `;
  const [rows] = await db.query(sql, [criminalId]);
  return rows;
}

async function findById(criminalId) {
  const sql = `
    SELECT
      criminal_id AS criminalId,
      full_name AS fullName,
      alias_name AS aliasName,
      age,
      gender,
      notes,
      created_at AS createdAt
    FROM Criminal
    WHERE criminal_id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [criminalId]);
  return rows[0] || null;
}

module.exports = {
  createCriminal,
  findAll,
  findHistoryByCriminalId,
  findById,
};
