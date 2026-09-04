const express = require("express");

const CallMonitoring = require("../models/CallMonitoring");
const SecurityEvent = require("../models/SecurityEvent");
const User = require("../models/User");
const TrustedContact = require("../models/TrustedContact");

const router = express.Router();


// =====================================================
// START CALL MONITORING
// POST /api/call-monitoring/start
// =====================================================

router.post("/start", async (req, res) => {
  try {
    const {
      user,
      caller = "",
    } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const call = await CallMonitoring.create({
      user,
      caller,
      status: "MONITORING",
    });

    return res.status(201).json({
      success: true,
      message: "Call monitoring started",
      call,
    });

  } catch (error) {
    console.error("Start call monitoring error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start call monitoring",
      error: error.message,
    });
  }
});


// =====================================================
// UPDATE CALL ANALYSIS
// POST /api/call-monitoring/:id/analyze
// =====================================================

router.post("/:id/analyze", async (req, res) => {
  try {
    const {
      transcript,
      riskScore,
      riskLevel,
      detectedSignals,
    } = req.body;

    const call = await CallMonitoring.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call monitoring session not found",
      });
    }

    if (transcript !== undefined) {
      call.transcript = transcript;
    }

    if (riskScore !== undefined) {
      call.riskScore = riskScore;
    }

    if (riskLevel !== undefined) {
      call.riskLevel = riskLevel;
    }

    if (detectedSignals !== undefined) {
      call.detectedSignals = detectedSignals;
    }

    await call.save();

    return res.status(200).json({
      success: true,
      message: "Call analysis updated",
      call,
    });

  } catch (error) {
    console.error("Call analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update call analysis",
      error: error.message,
    });
  }
});


// =====================================================
// SAFE PAUSE
// POST /api/call-monitoring/:id/safe-pause
// =====================================================

router.post("/:id/safe-pause", async (req, res) => {
  try {
    const call = await CallMonitoring.findByIdAndUpdate(
      req.params.id,
      {
        safePause: true,
        status: "SAFE_PAUSE",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call monitoring session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Safe pause activated",
      call,
    });

  } catch (error) {
    console.error("Safe pause error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate safe pause",
      error: error.message,
    });
  }
});


// =====================================================
// GUARDIAN ALERT FOR EXISTING CALL
// POST /api/call-monitoring/:id/guardian-alert
// =====================================================

router.post("/:id/guardian-alert", async (req, res) => {
  try {
    const call = await CallMonitoring.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call monitoring session not found",
      });
    }

    const contact =
      (await TrustedContact.findOne({
        user: call.user,
        isPrimary: true,
      })) ||
      (await TrustedContact.findOne({
        user: call.user,
      }).sort({ priority: 1 }));

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "No trusted contact found for this user",
      });
    }

    call.guardianAlerted = true;
    call.safePause = false;
    call.status = "GUARDIAN_ALERTED";

    await call.save();

    const event = await SecurityEvent.create({
      user: call.user,
      type: "GUARDIAN_ALERT",
      title: "Trusted contact alerted",
      description:
        "A trusted contact was alerted because suspicious activity was detected during a monitored call.",
      riskScore: call.riskScore,
      riskLevel: call.riskLevel,
      status: "ESCALATED",
      metadata: {
        callId: call._id,
        transcript: call.transcript,
        callerOrSender: call.caller,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        relationship: contact.relationship,
        source: "LIVE_CALL_MONITORING",
        action: "GUARDIAN_ALERT",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Trusted contact alerted successfully",

      guardian: {
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
      },

      call: {
        id: call._id,
        status: call.status,
        guardianAlerted: call.guardianAlerted,
      },

      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        riskScore: event.riskScore,
        riskLevel: event.riskLevel,
        createdAt: event.createdAt,
      },
    });

  } catch (error) {
    console.error("Guardian alert error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to alert trusted contact",
      error: error.message,
    });
  }
});


// =====================================================
// DIRECT GUARDIAN ALERT
// POST /api/call-monitoring/guardian-alert
// =====================================================

router.post("/guardian-alert", async (req, res) => {
  try {
    const {
      user,
      riskScore = 0,
      riskLevel = "HIGH",
      transcript = "",
      callerOrSender = "",
    } = req.body;

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const existingUser = await User.findById(user);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const contact =
      (await TrustedContact.findOne({
        user,
        isPrimary: true,
      })) ||
      (await TrustedContact.findOne({
        user,
      }).sort({ priority: 1 }));

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "No trusted contact found for this user",
      });
    }

    const event = await SecurityEvent.create({
      user,
      type: "GUARDIAN_ALERT",
      title: "Trusted contact alerted",
      description:
        "A trusted contact was alerted because suspicious activity was detected.",
      riskScore,
      riskLevel,
      status: "ESCALATED",

      metadata: {
        transcript,
        callerOrSender,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        relationship: contact.relationship,
        source: "LIVE_CALL_MONITORING",
        action: "GUARDIAN_ALERT",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Trusted contact alerted successfully",

      guardian: {
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
      },

      event: {
        id: event._id,
        type: event.type,
        status: event.status,
        riskScore: event.riskScore,
        riskLevel: event.riskLevel,
        createdAt: event.createdAt,
      },
    });

  } catch (error) {
    console.error("Direct guardian alert error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create guardian alert",
      error: error.message,
    });
  }
});


// =====================================================
// ACTIVATE SOS
// POST /api/call-monitoring/:id/sos
// =====================================================

router.post("/:id/sos", async (req, res) => {
  try {
    const call = await CallMonitoring.findById(req.params.id);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call monitoring session not found",
      });
    }

    call.sosActive = true;
    call.safePause = false;
    call.status = "SOS";

    await call.save();

    const event = await SecurityEvent.create({
      user: call.user,
      type: "SOS",
      title: "Emergency SOS activated",
      description: "Emergency SOS was activated during a monitored call.",
      riskScore: call.riskScore,
      riskLevel: call.riskLevel,
      status: "ESCALATED",
      metadata: {
        callId: call._id,
        caller: call.caller,
        source: "LIVE_CALL_MONITORING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Emergency SOS activated",
      call,
      event,
    });

  } catch (error) {
    console.error("SOS error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to activate SOS",
      error: error.message,
    });
  }
});


// =====================================================
// END CALL
// POST /api/call-monitoring/:id/end
// =====================================================

router.post("/:id/end", async (req, res) => {
  try {
    const call = await CallMonitoring.findByIdAndUpdate(
      req.params.id,
      {
        status: "ENDED",
        endedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call monitoring session not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Call monitoring ended",
      call,
    });

  } catch (error) {
    console.error("End call error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to end call monitoring",
      error: error.message,
    });
  }
});


// =====================================================
// GET USER CALL HISTORY
// GET /api/call-monitoring/user/:userId
// =====================================================

router.get("/user/:userId", async (req, res) => {
  try {
    const calls = await CallMonitoring.find({
      user: req.params.userId,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: calls.length,
      calls,
    });

  } catch (error) {
    console.error("Call history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch call history",
      error: error.message,
    });
  }
});


console.log("Guardian Alert routes registered");
console.log("SOS route registered");


module.exports = router;