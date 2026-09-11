const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  analyzeScreenshot,
} = require("../controllers/screenshotController");

const router = express.Router();

router.post(
  "/analyze",
  upload.single("screenshot"),
  analyzeScreenshot
);

module.exports = router;