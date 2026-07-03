const notificationService = require("../../services/members/notification.service");
const ApiResponse = require("../../utils/response");

class NotificationController {
  async getNotifications(req, res) {
    try {
      const memberId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const notifications = await notificationService.getNotifications(memberId, limit, offset);
      return ApiResponse.success(res, notifications, "Lấy danh sách thông báo thành công");
    } catch (error) {
      console.error("Get Notifications Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy danh sách thông báo");
    }
  }

  async markAsRead(req, res) {
    try {
      const memberId = req.user.id;
      const { id } = req.params;

      const updated = await notificationService.markAsRead(id, memberId);
      return ApiResponse.success(res, updated, "Đánh dấu đã đọc thành công");
    } catch (error) {
      console.error("Mark Notification Read Error:", error);
      if (error.message === "NOTIFICATION_NOT_FOUND") {
        return ApiResponse.notFound(res, "Không tìm thấy thông báo");
      }
      if (error.message === "UNAUTHORIZED") {
        return ApiResponse.error(res, "Bạn không có quyền thao tác trên thông báo này", 403);
      }
      return ApiResponse.serverError(res, "Lỗi server khi đánh dấu đã đọc");
    }
  }

  async markAllAsRead(req, res) {
    try {
      const memberId = req.user.id;
      await notificationService.markAllAsRead(memberId);
      return ApiResponse.success(res, null, "Đánh dấu đọc tất cả thông báo thành công");
    } catch (error) {
      console.error("Mark All Notifications Read Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi đánh dấu đọc tất cả");
    }
  }
}

module.exports = new NotificationController();
