const express = require("express");

const {
  getSafetyMeter,
  addSecurityEvent,
} = require("../controllers/safetyMeterController");

const router = express.Router();

// Get current safety score
router.get("/", getSafetyMeter);

// Record security activity
router.post("/event", addSecurityEvent);

module.exports = router;