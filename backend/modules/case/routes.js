const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const caseController = require("./controller");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), caseController.createCase);
router.get("/", authMiddleware, caseController.getCases);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), caseController.updateCase);

module.exports = router;
