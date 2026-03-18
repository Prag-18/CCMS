const express = require("express");

const authRoutes = require("../modules/auth/routes");
const crimeRoutes = require("../modules/crime/routes");
const caseRoutes = require("../modules/case/routes");
const criminalRoutes = require("../modules/criminal/criminal.routes");
const victimRoutes = require("../modules/victim/routes");
const evidenceRoutes = require("../modules/evidence/routes");
const analyticsRoutes = require("../modules/analytics/routes");
const userRoutes = require("../modules/user/routes");
 
 
const router = express.Router();

// API gateway: each module owns its controller/service/repository stack.
router.use("/auth", authRoutes);
router.use("/crimes", crimeRoutes);
router.use("/cases", caseRoutes);
router.use("/criminals", criminalRoutes);
router.use("/victims", victimRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/", userRoutes);
router.use("/", evidenceRoutes);

module.exports = router;
