const express = require("express");
const crimeController = require("./controller");

const router = express.Router();

router.post("/", crimeController.createCrime);
router.get("/", crimeController.getCrimes);
router.get("/:id", crimeController.getCrime);
router.put("/:id", crimeController.updateCrime);

module.exports = router;
