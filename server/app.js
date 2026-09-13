const screenshotRoutes = require("./routes/screenshotRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const callMonitoringRoutes = require("./routes/callMonitoringRoutes");
const callerVerificationRoutes = require("./routes/callerVerificationRoutes");
const contactRoutes = require("./routes/contactRoutes");
const securityEventRoutes = require("./routes/securityEventRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const safetyMeterRoutes = require("./routes/safetyMeterRoutes");
const securityNotificationRoutes = require("./routes/securityNotificationRoutes");
const scannerRoutes = require("./routes/scannerRoutes");


// ==========================================
// ELDERLY MODE ROUTES
// ==========================================
const elderlyModeRoutes = require("./routes/elderlyModeRoutes");

dotenv.config();

const app = express();

// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://cyber-shield-ai-nu.vercel.app",
    ],
    credentials: true,
  })
);

// IMPORTANT: Body parser MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/screenshot", screenshotRoutes);
app.use("/api/call-monitoring", callMonitoringRoutes);


// =========================
// ROUTES
// =========================

app.use("/api/contacts", contactRoutes);
app.use("/api/security-events", securityEventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/caller-verification", callerVerificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/safety-meter",safetyMeterRoutes);
app.use("/api/security-notifications",securityNotificationRoutes);
app.use("/api/scanner", scannerRoutes);
// ==========================================
// ELDERLY MODE
// ==========================================

app.use("/api/elderly", elderlyModeRoutes);


// =========================
// HEALTH CHECK
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cyber Shield AI Backend is running 🚀",
    status: "online",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Cyber Shield AI API is healthy",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;