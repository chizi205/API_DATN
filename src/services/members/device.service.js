const deviceRepository = require('../../repositories/members/device.repository');
const admin = require('../../config/firebase');

class DeviceService {
  async registerDevice(userId, fcmToken, deviceInfo) {
    if (!fcmToken) {
      throw new Error('FCM_TOKEN_REQUIRED');
    }
    return await deviceRepository.registerDevice(userId, fcmToken, deviceInfo);
  }

  /**
   * Gửi push notification cho một user
   */
  async sendNotificationToUser(userId, title, body, data = {}) {
    const tokens = await deviceRepository.getActiveTokensByUserId(userId);

    if (tokens.length === 0) {
      console.log(`User ${userId} không có device token nào active`);
      return { success: false, message: 'No active devices' };
    }

    const message = {
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // Quan trọng nếu dùng Flutter
      },
      tokens: tokens, // Gửi cho nhiều thiết bị cùng lúc
    };

    try {
      const response = await admin.messaging().sendMulticast(message);
      console.log('Push notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }
}

module.exports = new DeviceService();