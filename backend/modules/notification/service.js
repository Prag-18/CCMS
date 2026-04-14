const notificationRepository = require("./repository");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getNotifications(officerId) {
  const parsedOfficerId = Number(officerId);
  if (!Number.isFinite(parsedOfficerId) || parsedOfficerId <= 0) {
    throw createError("Authenticated officer is required", 401);
  }

  return notificationRepository.findByOfficerId(parsedOfficerId);
}

async function markAllAsRead(officerId) {
  const parsedOfficerId = Number(officerId);
  if (!Number.isFinite(parsedOfficerId) || parsedOfficerId <= 0) {
    throw createError("Authenticated officer is required", 401);
  }

  const updated = await notificationRepository.markAllAsRead(parsedOfficerId);
  return { updated };
}

async function notifyOfficer(officerId, message) {
  const parsedOfficerId = Number(officerId);
  const text = String(message || "").trim();

  if (!Number.isFinite(parsedOfficerId) || parsedOfficerId <= 0 || !text) {
    return null;
  }

  return notificationRepository.createNotification({
    officerId: parsedOfficerId,
    message: text,
    isRead: false,
  });
}

module.exports = {
  getNotifications,
  markAllAsRead,
  notifyOfficer,
};
