const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const crimeController = require("./controller");

const router = express.Router();

router.post("/", authMiddleware, crimeController.createCrime);
router.get("/", crimeController.getCrimes);
router.get("/:id", crimeController.getCrime);
router.put("/:id", crimeController.updateCrime);

module.exports = router;
