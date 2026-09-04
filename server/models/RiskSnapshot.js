const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["ai", "link", "call"],
      required: true,
    },

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical",
      ],
      default: "low",
    },

    points: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SecurityEvent",
  securityEventSchema
);