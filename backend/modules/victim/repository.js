const { db } = require("../../core/config/db");

async function createVictim(connection, payload) {
  const sql = `
    INSERT INTO Victim (
      full_name,
      contact_number,
      address,
      age,
      gender
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  const [result] = await connection.execute(sql, [
    payload.fullName,
    payload.contactNumber,
    payload.address,
    payload.age,
    payload.gender,
  ]);

  return result.insertId;
}

async function linkVictimToCrime(connection, victimId, crimeId) {
  const sql = `
    INSERT INTO CrimeVictim (crime_id, victim_id)
    VALUES (?, ?)
  `;
  await connection.execute(sql, [crimeId, victimId]);
}

async function findById(victimId) {
  const sql = `
    SELECT
      victim_id AS victimId,
      full_name AS fullName,
      contact_number AS contactNumber,
      address,
      age,
      gender,
      created_at AS createdAt
    FROM Victim
    WHERE victim_id = ?
    LIMIT 1
  `;

  const [rows] = await db.query(sql, [victimId]);
  return rows[0] || null;
}

async function findAll() {
  const sql = `
    SELECT
      victim_id AS victimId,
      full_name AS fullName,
      contact_number AS contactNumber,
      address,
      age,
      gender,
      created_at AS createdAt
    FROM Victim
    ORDER BY created_at DESC
  `;
  const [rows] = await db.query(sql);
  return rows;
}

module.exports = {
  createVictim,
  linkVictimToCrime,
  findById,
  findAll,
};
