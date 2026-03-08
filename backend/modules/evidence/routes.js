const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../../core/config/env");
const authMiddleware = require("../../core/middleware/auth.middleware");
const roleMiddleware = require("../../core/middleware/role.middleware");
const evidenceController = require("./controller");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),

  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (env.maxUploadSizeMb || 10) * 1024 * 1024,
  },
});

router.post(
  "/evidence",
  authMiddleware,
  roleMiddleware("ADMIN", "OFFICER", "INVESTIGATOR"),
  upload.single("file"),
  evidenceController.uploadEvidence
);

router.get(
  "/cases/:id/evidence",
  authMiddleware,
  evidenceController.getCaseEvidence
);

module.exports = router;