const mongoose = require("mongoose");

const callMonitoringSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    caller: {
      type: String,
      default: "",
      trim: true,
    },

    transcript: {
      type: String,
      default: "",
    },

    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },

    detectedSignals: {
      type: [String],
      default: [],
    },

    safePause: {
      type: Boolean,
      default: false,
    },

    guardianAlerted: {
      type: Boolean,
      default: false,
    },

    sosActive: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "MONITORING",
        "SAFE_PAUSE",
        "GUARDIAN_ALERTED",
        "SOS",
        "ENDED",
      ],
      default: "MONITORING",
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CallMonitoring",
  callMonitoringSchema
);