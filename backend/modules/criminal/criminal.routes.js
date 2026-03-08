const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const criminalController = require("./criminal.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"),
  criminalController.createCriminal
);
router.get("/", authMiddleware, criminalController.getCriminals);

module.exports = router;
