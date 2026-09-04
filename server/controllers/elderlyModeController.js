const ElderlyMode = require("../models/ElderlyMode");
const EmergencyAlert = require("../models/EmergencyAlert");

const {
  buildSafetyOverview,
} = require("../services/elderlySafetyService");


// ==========================================
// GET ELDERLY MODE STATUS
// ==========================================

const getElderlyModeStatus = async (req, res) => {
  try {
    let settings = await ElderlyMode.findOne();

    // First-time default settings
    if (!settings) {
      settings = await ElderlyMode.create({
        elderlyModeEnabled: true,
        aiGuardianEnabled: true,
        scamProtection: true,
        callProtection: true,
        fraudAlerts: true,
        activeThreats: 0,
      });
    }

    const overview = buildSafetyOverview(settings);

    settings.protectionScore = overview.protectionScore;
    settings.lastSafetyCheck = new Date();

    await settings.save();

    return res.status(200).json({
      success: true,
      settings,
      overview,
    });

  } catch (error) {
    console.error(
      "Get Elderly Mode Status Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load elderly mode status",
    });
  }
};


// ==========================================
// UPDATE ELDERLY MODE SETTINGS
// ==========================================

const updateElderlyModeSettings = async (req, res) => {
  try {
    const {
      elderlyModeEnabled,
      aiGuardianEnabled,
      scamProtection,
      callProtection,
      fraudAlerts,
    } = req.body;

    let settings = await ElderlyMode.findOne();

    if (!settings) {
      settings = new ElderlyMode();
    }

    if (typeof elderlyModeEnabled === "boolean") {
      settings.elderlyModeEnabled =
        elderlyModeEnabled;
    }

    if (typeof aiGuardianEnabled === "boolean") {
      settings.aiGuardianEnabled =
        aiGuardianEnabled;
    }

    if (typeof scamProtection === "boolean") {
      settings.scamProtection =
        scamProtection;
    }

    if (typeof callProtection === "boolean") {
      settings.callProtection =
        callProtection;
    }

    if (typeof fraudAlerts === "boolean") {
      settings.fraudAlerts =
        fraudAlerts;
    }

    settings.lastSafetyCheck = new Date();

    const overview = buildSafetyOverview(settings);

    settings.protectionScore =
      overview.protectionScore;

    await settings.save();

    return res.status(200).json({
      success: true,
      message:
        "Elderly mode settings updated successfully",
      settings,
      overview,
    });

  } catch (error) {
    console.error(
      "Update Elderly Mode Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update elderly mode settings",
    });
  }
};


// ==========================================
// CREATE SOS ALERT
// ==========================================

const createSOSAlert = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      message,
    } = req.body;

    const alert = await EmergencyAlert.create({
      type: "SOS",

      message:
        message ||
        "Emergency assistance requested from Elderly Mode",

      location: {
        latitude:
          typeof latitude === "number"
            ? latitude
            : null,

        longitude:
          typeof longitude === "number"
            ? longitude
            : null,
      },

      status: "active",
      source: "elderly-mode",
    });

    let settings = await ElderlyMode.findOne();

    if (!settings) {
      settings = await ElderlyMode.create({});
    }

    settings.activeThreats += 1;

    const overview = buildSafetyOverview(settings);

    settings.protectionScore =
      overview.protectionScore;

    settings.lastSafetyCheck = new Date();

    await settings.save();

    return res.status(201).json({
      success: true,
      message:
        "SOS alert created successfully",
      alert,
      overview,
    });

  } catch (error) {
    console.error(
      "SOS Alert Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create SOS alert",
    });
  }
};


// ==========================================
// GET EMERGENCY ALERTS
// ==========================================

const getEmergencyAlerts = async (req, res) => {
  try {
    const alerts = await EmergencyAlert.find()
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });

  } catch (error) {
    console.error(
      "Get Emergency Alerts Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch emergency alerts",
    });
  }
};


// ==========================================
// RESOLVE EMERGENCY ALERT
// ==========================================

const resolveEmergencyAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert =
      await EmergencyAlert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Emergency alert not found",
      });
    }

    if (alert.status !== "resolved") {
      alert.status = "resolved";
      alert.resolvedAt = new Date();

      await alert.save();

      const settings =
        await ElderlyMode.findOne();

      if (settings) {
        settings.activeThreats =
          Math.max(
            0,
            settings.activeThreats - 1
          );

        const overview =
          buildSafetyOverview(settings);

        settings.protectionScore =
          overview.protectionScore;

        settings.lastSafetyCheck =
          new Date();

        await settings.save();
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Emergency alert resolved successfully",
      alert,
    });

  } catch (error) {
    console.error(
      "Resolve Emergency Alert Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to resolve emergency alert",
    });
  }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getElderlyModeStatus,
  updateElderlyModeSettings,
  createSOSAlert,
  getEmergencyAlerts,
  resolveEmergencyAlert,
}