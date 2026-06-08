const deviceService = require("../../services/members/device.service");
const ApiResponse = require("../../utils/response");

const registerDeviceController = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { fcm_token, device_info } = req.body;

    const device = await deviceService.registerDevice(
      userId,
      fcm_token,
      device_info,
    );

    return ApiResponse.success(res, device, "Đăng ký thiết bị thành công");
  } catch (error) {
    console.error("Register Device Error:", error);

    if (error.message === "FCM_TOKEN_REQUIRED") {
      return ApiResponse.badRequest(res, "Thiếu FCM token");
    }

    return ApiResponse.serverError(res, "Lỗi khi đăng ký thiết bị");
  }
};

module.exports = {
  registerDeviceController,
};
