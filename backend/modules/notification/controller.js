const notificationService = require("./service");
const { success } = require("../../core/utils/response");

async function getNotifications(req, res, next) {
  try {
    const officerId = req.user && req.user.officer_id;
    const data = await notificationService.getNotifications(officerId);
    return success(res, {
      message: "Notifications fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    const officerId = req.user && req.user.officer_id;
    const data = await notificationService.markAllAsRead(officerId);
    return success(res, {
      message: "Notifications marked as read",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getNotifications,
  markAllRead,
};
