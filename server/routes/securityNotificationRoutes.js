const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} = require("../controllers/securityNotificationController");

const router = express.Router();

// ==========================================
// SECURITY NOTIFICATIONS
// ==========================================

// Get all notifications
router.get("/", getNotifications);

// Mark one notification as read
router.patch("/:id/read", markNotificationAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsAsRead);

// Clear all notifications
router.delete("/", clearAllNotifications);

module.exports = router;