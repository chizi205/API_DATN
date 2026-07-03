const notificationRepository = require("../../repositories/members/notification.repository");

class NotificationService {
  async getNotifications(memberId, limit = 20, offset = 0) {
    return await notificationRepository.getNotificationsByMember(memberId, limit, offset);
  }

  async markAsRead(id, memberId) {
    const notification = await notificationRepository.findById(id);
    if (!notification) {
      throw new Error("NOTIFICATION_NOT_FOUND");
    }
    
    // Authorization check
    if (notification.member_id !== null && Number(notification.member_id) !== Number(memberId)) {
      throw new Error("UNAUTHORIZED");
    }

    return await notificationRepository.markAsRead(id, memberId);
  }

  async markAllAsRead(memberId) {
    return await notificationRepository.markAllAsRead(memberId);
  }
}

module.exports = new NotificationService();
