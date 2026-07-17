const rateLimit = require("express-rate-limit");
const ApiResponse = require("../utils/response");

// Giới hạn gửi OTP: Tối đa 15 yêu cầu gửi OTP từ 1 IP trong vòng 1 giờ để chống Spam tin nhắn
const sendOtpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 15, // Tối đa 15 yêu cầu
  standardHeaders: true, // Trả về thông tin RateLimit trong headers RateLimit-*
  legacyHeaders: false, // Tắt headers X-RateLimit-*
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      "Bạn đã yêu cầu gửi mã OTP quá nhiều lần từ địa chỉ IP này. Vui lòng thử lại sau 1 giờ.",
      429
    );
  },
});

// Giới hạn xác thực OTP: Tối đa 20 yêu cầu xác thực từ 1 IP trong vòng 30 phút để chống Brute force
const verifyOtpLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 phút
  max: 20, // Tối đa 20 yêu cầu
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return ApiResponse.error(
      res,
      "Bạn đã thử xác thực mã OTP sai quá nhiều lần từ địa chỉ IP này. Vui lòng thử lại sau 30 phút.",
      429
    );
  },
});

module.exports = {
  sendOtpLimiter,
  verifyOtpLimiter,
};
