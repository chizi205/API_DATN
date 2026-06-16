const deviceRepository = require("../../repositories/members/device.repository");
const admin = require("../../config/firebase");

class DeviceService {
  /**
   * Đăng ký thiết bị (FCM Token)
   */
  async registerDevice(userId, fcmToken, deviceInfo = {}) {
    if (!fcmToken) {
      throw new Error("FCM_TOKEN_REQUIRED");
    }
    return await deviceRepository.registerDevice(userId, fcmToken, deviceInfo);
  }

  async sendNotificationToUser(userId, title, body, data = {}) {
    try {
      const tokens = await deviceRepository.getActiveTokensByUserId(userId);

      if (tokens.length === 0) {
        console.log(`User ${userId} không có thiết bị nào đang active`);
        return { success: false, message: "No active devices" };
      }

      const message = {
        notification: {
          title: title,
          body: body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      console.log(`✅ Gửi thông báo thành công cho user ${userId}`);
      console.log(`   - Thành công: ${response.successCount}`);
      console.log(`   - Thất bại: ${response.failureCount}`);

      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
            console.error(`Token lỗi: ${tokens[idx]}`, resp.error);
          }
        });

        if (failedTokens.length > 0) {
          await deviceRepository.removeInvalidTokens(failedTokens);
        }
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error("Lỗi khi gửi thông báo:", error);
      throw new Error("Gửi thông báo thất bại");
    }
  }
}

module.exports = new DeviceService();
