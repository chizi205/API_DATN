// controllers/auth.controller.js
const AuthService = require("../../services/members/auth.service");
const ApiResponse = require("../../utils/response");

const sendOtpController = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await AuthService.sendOTP(phone);

    return ApiResponse.success(
      res,
      result,
      "Mã OTP đã được gửi thành công"
    );
  } catch (error) {
    console.error("Send OTP Controller Error:", error);
    return ApiResponse.error(res, error.message, 400);
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { phone, code } = req.body;
    const result = await AuthService.verifyOTP(phone, code);

    const message = result.isNewUser
      ? "Xác thực OTP thành công. Vui lòng hoàn tất thông tin đăng ký"
      : "Đăng nhập thành công";

    return ApiResponse.success(res, result, message);
  } catch (error) {
    console.error("Verify OTP Controller Error:", error);
    return ApiResponse.error(res, error.message, 400);
  }
};

const completeRegistrationController = async (req, res) => {
  try {
    const { full_name, email, date_of_birth } = req.body;
    const { member_id } = req.registrationData;

    const result = await AuthService.completeRegistration(member_id, {
      full_name,
      email,
      date_of_birth,
    });

    return ApiResponse.success(res, result, "Đăng ký thành công");
  } catch (error) {
    console.error("Complete Registration Error:", error);
    return ApiResponse.error(res, error.message, error.message.includes("Không tìm thấy") ? 404 : 500);
  }
};

const refreshTokenController = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    const result = await AuthService.refreshToken(refresh_token);

    return ApiResponse.success(res, result, "Làm mới token thành công");
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return ApiResponse.error(res, error.message, 401);
  }
};

const logoutController = async (req, res) => {
  try {
    const memberId = req.user?.id;
    await AuthService.logout(memberId);

    return ApiResponse.success(res, null, "Đăng xuất thành công");
  } catch (error) {
    console.error("Logout Error:", error);
    return ApiResponse.error(res, error.message, 401);
  }
};

module.exports = {
  sendOtpController,
  verifyOtpController,
  completeRegistrationController,
  refreshTokenController,
  logoutController,
};