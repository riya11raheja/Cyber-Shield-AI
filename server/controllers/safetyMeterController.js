const SecurityEvent = require("../models/SecurityEvent");

// ==================================================
// TYPE NORMALIZATION
// ==================================================

const normalizeType = (type) => {
  const value = String(type || "").toLowerCase();

  const map = {
    ai: "GUARDIAN_ALERT",
    guardian: "GUARDIAN_ALERT",
    guardian_alert: "GUARDIAN_ALERT",

    link: "LINK_SCAN",
    link_scan: "LINK_SCAN",

    call: "SCAM_CALL",
    scam_call: "SCAM_CALL",

    caller_verification: "CALLER_VERIFICATION",

    screenshot: "SCREENSHOT_ANALYSIS",
    screenshot_analysis: "SCREENSHOT_ANALYSIS",

    evidence: "EVIDENCE_CAPTURE",
    evidence_capture: "EVIDENCE_CAPTURE",

    sos: "SOS",

    alert: "GUARDIAN_ALERT",
    guardian_alert: "GUARDIAN_ALERT",
  };

  return map[value] || type;
};

// ==================================================
// GET SAFETY METER
// ==================================================

const getSafetyMeter = async (req, res) => {
  try {
    const events = await SecurityEvent.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // ==================================================
    // RISK CALCULATION
    // ==================================================

    const totalRisk = events.reduce(
      (total, event) =>
        total + Number(event.riskScore || 0),
      0
    );

    const averageRisk =
      events.length > 0
        ? Math.min(
            100,
            Math.round(totalRisk / events.length)
          )
        : 0;

    const score = Math.max(
      0,
      100 - averageRisk
    );

    // ==================================================
    // RISK LEVEL
    // ==================================================

    let level = "Low Risk";

    let description =
      "Your recent security activity looks safe.";

    if (score <= 25) {
      level = "Critical Risk";
      description =
        "Critical security activity detected. Immediate action is recommended.";
    } else if (score <= 50) {
      level = "High Risk";
      description =
        "Multiple risky activities were detected. Stay alert.";
    } else if (score <= 75) {
      level = "Moderate Risk";
      description =
        "Some suspicious activity was detected. Verify before taking action.";
    }

    // ==================================================
    // DYNAMIC SOURCE COUNTS
    // ==================================================

    const stats = {
      ai: events.filter(
        (event) =>
          event.type === "GUARDIAN_ALERT" ||
          event.type === "SCREENSHOT_ANALYSIS"
      ).length,

      links: events.filter(
        (event) =>
          event.type === "LINK_SCAN"
      ).length,

      calls: events.filter(
        (event) =>
          event.type === "SCAM_CALL" ||
          event.type === "CALLER_VERIFICATION"
      ).length,

      sos: events.filter(
        (event) =>
          event.type === "SOS"
      ).length,
    };

    // ==================================================
    // RECENT ACTIVITY
    // ==================================================

    const formattedEvents = events.map(
      (event) => ({
        _id: event._id,
        type: event.type,
        title: event.title,
        description: event.description,

        severity:
          event.riskLevel?.toLowerCase() || "low",

        points: Number(event.riskScore || 0),

        riskScore:
          Number(event.riskScore || 0),

        riskLevel:
          event.riskLevel || "LOW",

        status:
          event.status || "DETECTED",

        createdAt: event.createdAt,
      })
    );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      data: {
        score,
        level,
        description,

        stats,

        events: formattedEvents,

        summary: {
          totalEvents: events.length,
          totalRisk,
          averageRisk,
        },
      },
    });

  } catch (error) {
    console.error(
      "SAFETY METER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to calculate safety score.",
    });
  }
};

// ==================================================
// ADD SECURITY EVENT
// ==================================================

const addSecurityEvent = async (req, res) => {
  try {
    let {
      type,
      title,
      description,
      riskScore,
      riskLevel,
      status,
      metadata,
    } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message:
          "type and title are required.",
      });
    }

    // ==================================================
    // NORMALIZE FRONTEND TYPE
    // ==================================================

    type = normalizeType(type);

    // ==================================================
    // NORMALIZE VALUES
    // ==================================================

    const allowedRiskLevels = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ];

    const allowedStatuses = [
      "DETECTED",
      "BLOCKED",
      "RESOLVED",
      "ESCALATED",
    ];

    riskLevel =
      String(riskLevel || "LOW").toUpperCase();

    status =
      String(status || "DETECTED").toUpperCase();

    if (!allowedRiskLevels.includes(riskLevel)) {
      riskLevel = "LOW";
    }

    if (!allowedStatuses.includes(status)) {
      status = "DETECTED";
    }

    // ==================================================
    // CREATE EVENT
    // ==================================================

    const eventData = {
      type,

      title,

      description:
        description || "",

      riskScore: Math.max(
        0,
        Math.min(
          100,
          Number(riskScore || 0)
        )
      ),

      riskLevel,

      status,

      metadata:
        metadata || {},
    };

    // Auth disabled hai,
    // isliye user intentionally nahi bhej rahe.

    const event =
      await SecurityEvent.create(eventData);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Security event recorded.",

      event,
    });

  } catch (error) {
    console.error(
      "ADD SECURITY EVENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to record security event.",
      error: error.message,
    });
  }
};

module.exports = {
  getSafetyMeter,
  addSecurityEvent,
};