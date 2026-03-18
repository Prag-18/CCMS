const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const crimeController = require("./controller");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN", "OFFICER"), crimeController.createCrime);
router.get("/", authMiddleware, crimeController.getCrimes);
router.get("/:id", authMiddleware, crimeController.getCrime);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN", "OFFICER"), crimeController.updateCrime);

module.exports = router;
