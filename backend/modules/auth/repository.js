const { query } = require("../../core/config/db");

async function findOfficerByIdentifier(identifier) {
  const sql = `
    SELECT
      officer_id AS officerId,
      full_name AS fullName,
      email,
      badge_number AS badgeNumber,
      role,
      station_id AS stationId,
      password_hash AS passwordHash,
      is_active AS isActive
    FROM Officer
    WHERE (email = ? OR badge_number = ?)
    LIMIT 1
  `;

  const [rows] = await query(sql, [identifier, identifier]);
  return rows[0] || null;
}

async function updateLastLogin(officerId) {
  const sql = `
    UPDATE Officer
    SET last_login_at = NOW()
    WHERE officer_id = ?
  `;
  await query(sql, [officerId]);
}

module.exports = {
  findOfficerByIdentifier,
  updateLastLogin,
};
