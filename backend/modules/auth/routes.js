const express = require("express");
const controller = require("./controller");
const authMiddleware = require("../../core/middleware/auth.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/officers", authMiddleware, controller.getOfficers);

module.exports = router;
