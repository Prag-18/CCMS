const express = require("express");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const caseController = require("./controller");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), caseController.createCase);
router.get("/", authMiddleware, caseController.getCases);
router.get("/timeline/recent", authMiddleware, caseController.getRecentTimeline);
router.get("/:id/timeline", authMiddleware, caseController.getCaseTimeline);
router.get("/:id", authMiddleware, caseController.getCaseById);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"), caseController.updateCase);

module.exports = router;
