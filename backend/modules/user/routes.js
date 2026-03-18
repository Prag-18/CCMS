const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const userController = require("./controller");

const router = express.Router();

router.get("/users", authMiddleware, roleMiddleware("ADMIN"), userController.getUsers);

module.exports = router;
