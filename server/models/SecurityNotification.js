const mongoose = require("mongoose");

const securityNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["threat", "protection", "ai"],
      required: true,
    },

    source: {
      type: String,
      enum: ["ai", "link", "call", "system"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    unread: {
      type: Boolean,
      default: true,
    },

    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SecurityEvent",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SecurityNotification",
  securityNotificationSchema
);