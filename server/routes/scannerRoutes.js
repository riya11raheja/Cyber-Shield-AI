const express = require("express");
const router = express.Router();

const { scanUrl } = require("../controllers/scannerController");

router.post("/scan", scanUrl);

module.exports = router;