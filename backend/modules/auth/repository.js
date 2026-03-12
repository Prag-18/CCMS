const { db } = require("../../core/config/db");

async function findOfficerByEmail(email) {
  const [rows] = await db.query(
    "SELECT * FROM Officer WHERE email = ?",
    [email]
  );
  return rows[0];
}

async function createOfficer(data) {
  const { name, email, password_hash, role } = data;

  const [result] = await db.query(
    `INSERT INTO Officer (name, email, password_hash, role)
     VALUES (?, ?, ?, ?)`,
    [name, email, password_hash, role]
  );

  return result.insertId;
}

module.exports = {
  findOfficerByEmail,
  createOfficer,
};