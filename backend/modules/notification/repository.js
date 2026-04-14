const { db } = require("../../core/config/db");

async function createNotification(payload) {
  const sql = `
    INSERT INTO Notification (
      officer_id,
      message,
      is_read
    )
    VALUES (?, ?, ?)
  `;

  const [result] = await db.query(sql, [
    payload.officerId,
    payload.message,
    payload.isRead ?? false,
  ]);

  return result.insertId;
}

async function findByOfficerId(officerId) {
  const sql = `
    SELECT
      notification_id AS notification_id,
      officer_id AS officer_id,
      message,
      is_read,
      created_at AS created_at
    FROM Notification
    WHERE officer_id = ?
    ORDER BY created_at DESC
  `;

  const [rows] = await db.query(sql, [officerId]);
  return rows;
}

async function markAllAsRead(officerId) {
  const sql = `
    UPDATE Notification
    SET is_read = TRUE
    WHERE officer_id = ?
      AND is_read = FALSE
  `;

  const [result] = await db.query(sql, [officerId]);
  return result.affectedRows;
}

module.exports = {
  createNotification,
  findByOfficerId,
  markAllAsRead,
};
