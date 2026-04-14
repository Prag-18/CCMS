const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const notificationController = require("./controller");

const router = express.Router();

router.get("/notifications", authMiddleware, notificationController.getNotifications);
router.put("/notifications/read-all", authMiddleware, notificationController.markAllRead);

module.exports = router;
