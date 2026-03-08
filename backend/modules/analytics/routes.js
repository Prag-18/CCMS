const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const analyticsController = require("./controller");

const router = express.Router();

router.get("/crime-trends", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), analyticsController.getCrimeTrends);
router.get("/crime-types", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), analyticsController.getCrimeTypes);
router.get("/hotspots", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), analyticsController.getHotspots);

module.exports = router;
