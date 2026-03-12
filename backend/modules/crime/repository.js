const { db } = require("../../core/config/db");

async function createCrime(crimeData) {
  const sql = `
    INSERT INTO Crime (
      crime_type,
      description,
      date_reported,
      location_id,
      reported_by
    )
    VALUES (?, ?, NOW(), ?, ?)
  `;

  const [result] = await db.execute(sql, [
    crimeData.crime_type,
    crimeData.description,
    crimeData.location_id,
    crimeData.reported_by,
  ]);

  return result.insertId;
}

async function getAllCrimes() {
  const sql = `
    SELECT
      crime_id,
      crime_type,
      description,
      date_reported,
      location_id,
      reported_by
    FROM Crime
    ORDER BY date_reported DESC
  `;

  const [rows] = await db.execute(sql);
  return rows;
}

async function getCrimeById(crimeId) {
  const sql = `
    SELECT
      crime_id,
      crime_type,
      description,
      date_reported,
      location_id,
      reported_by
    FROM Crime
    WHERE crime_id = ?
    LIMIT 1
  `;

  const [rows] = await db.execute(sql, [crimeId]);
  return rows[0] || null;
}

async function updateCrime(crimeId, updateData) {
  const fields = [];
  const values = [];

  if (updateData.crime_type !== undefined) {
    fields.push("crime_type = ?");
    values.push(updateData.crime_type);
  }

  if (updateData.description !== undefined) {
    fields.push("description = ?");
    values.push(updateData.description);
  }

  if (updateData.location_id !== undefined) {
    fields.push("location_id = ?");
    values.push(updateData.location_id);
  }

  if (updateData.reported_by !== undefined) {
    fields.push("reported_by = ?");
    values.push(updateData.reported_by);
  }

  if (fields.length === 0) {
    return false;
  }

  const sql = `
    UPDATE Crime
    SET ${fields.join(", ")}
    WHERE crime_id = ?
  `;

  values.push(crimeId);
  const [result] = await db.execute(sql, values);
  return result.affectedRows > 0;
}

module.exports = {
  createCrime,
  getAllCrimes,
  getCrimeById,
  updateCrime,
};
