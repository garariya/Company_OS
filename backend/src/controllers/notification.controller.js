import db from "../config/db.js";

// GET MY NOTIFICATIONS
export const getNotifications = async (req, res) => {
  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: Number(req.user.id)
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// MARK NOTIFICATION AS READ
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.notification.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    // Security check: Verify user owns this notification
    if (notification.userId !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Access denied. You can only access your own notifications."
      });
    }

    const updatedNotification = await db.notification.update({
      where: {
        id: Number(id)
      },
      data: {
        isRead: true
      }
    });

    return res.status(200).json({
      message: "Notification marked as read successfully",
      notification: updatedNotification
    });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await db.notification.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    // Security check: Verify user owns this notification
    if (notification.userId !== Number(req.user.id)) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own notifications."
      });
    }

    await db.notification.delete({
      where: {
        id: Number(id)
      }
    });

    return res.status(200).json({
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteNotification:", error);
    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};
