const SecurityNotification = require("../models/SecurityNotification");

// ==================================================
// OPTIONAL USER IDENTIFIER
// ==================================================
// Login/authentication removed hai.
//
// Agar future mein auth wapas add hota hai:
// req.user._id automatically use ho jayega.
//
// Abhi:
// 1. req.user._id
// 2. req.body.userId
// 3. req.query.userId
// 4. null/global notifications
//
// ==================================================

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.body?.userId ||
    req.query?.userId ||
    null
  );
};

// ==================================================
// GET NOTIFICATIONS
// ==================================================

const getNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    let query = {};

    // Agar user available hai to uski notifications
    // Agar login nahi hai to global notifications
    if (userId) {
      query.user = userId;
    }

    const notifications = await SecurityNotification.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const unreadCount = notifications.filter(
      (notification) => notification.unread === true
    ).length;

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==================================================
// MARK ONE NOTIFICATION AS READ
// ==================================================

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required.",
      });
    }

    const query = {
      _id: id,
    };

    // Auth available ho to user-specific update
    if (userId) {
      query.user = userId;
    }

    const notification =
      await SecurityNotification.findOneAndUpdate(
        query,
        {
          $set: {
            unread: false,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==================================================
// MARK ALL NOTIFICATIONS AS READ
// ==================================================

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = getUserId(req);

    const query = {
      unread: true,
    };

    if (userId) {
      query.user = userId;
    }

    const result = await SecurityNotification.updateMany(
      query,
      {
        $set: {
          unread: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      updatedCount: result.modifiedCount || 0,
    });
  } catch (error) {
    console.error("MARK ALL READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notifications.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==================================================
// CLEAR ALL NOTIFICATIONS
// ==================================================

const clearAllNotifications = async (req, res) => {
  try {
    const userId = getUserId(req);

    const query = {};

    if (userId) {
      query.user = userId;
    }

    const result = await SecurityNotification.deleteMany(query);

    return res.status(200).json({
      success: true,
      message: "Notifications cleared.",
      deletedCount: result.deletedCount || 0,
    });
  } catch (error) {
    console.error("CLEAR NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to clear notifications.",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
};