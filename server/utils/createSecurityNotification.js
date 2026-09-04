const SecurityNotification = require("../models/SecurityNotification");

const createSecurityNotification = async ({
  title,
  message,
  type = "protection",
  severity = "medium",
  source = "system",
  userId = null,
}) => {
  try {
    const notification = await SecurityNotification.create({
      title,
      message,
      type,
      severity,
      source,
      user: userId,
      unread: true,
    });

    return notification;
  } catch (error) {
    console.error(
      "CREATE SECURITY NOTIFICATION ERROR:",
      error
    );

    return null;
  }
};

module.exports = createSecurityNotification;