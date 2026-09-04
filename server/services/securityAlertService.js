const SecurityNotification = require("../models/SecurityNotification");

/**
 * Creates a notification ONLY when an actual security
 * event crosses the alert threshold.
 */
const createSecurityAlert = async ({
  userId,
  eventId = null,
  source,
  severity,
  title,
  message,
}) => {
  try {
    // ---------------------------------------------
    // Only real threats should generate alerts
    // ---------------------------------------------

    const alertLevels = [
      "medium",
      "high",
      "critical",
    ];

    if (!alertLevels.includes(severity)) {
      return null;
    }

    let type = "threat";

    if (source === "ai") {
      type = "ai";
    }

    const notification = await SecurityNotification.create({
      user: userId,
      eventId,
      source,
      type,
      title,
      message,
      severity,
      unread: true,
    });

    return notification;
  } catch (error) {
    console.error(
      "SECURITY ALERT CREATION ERROR:",
      error
    );

    return null;
  }
};

module.exports = {
  createSecurityAlert,
};