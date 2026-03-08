const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const victimController = require("./controller");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), victimController.createVictim);
router.get("/", authMiddleware, victimController.getVictims);

module.exports = router;
