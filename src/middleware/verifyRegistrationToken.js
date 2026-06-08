// src/middleware/verifyRegistrationToken.js
const { verifyAccessToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response');

const verifyRegistrationToken = (req, res, next) => {
  try {
    // Lấy token từ Header (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Thiếu Authorization header', 401);
    }

    const registration_token = authHeader.split(' ')[1]; // Lấy token sau "Bearer "

    if (!registration_token) {
      return ApiResponse.error(res, 'Thiếu registration_token', 400);
    }

    // Giải mã token
    const decoded = verifyAccessToken(registration_token);

    if (!decoded || decoded.purpose !== 'registration') {
      return ApiResponse.error(res, 'Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Gắn thông tin vào req
    req.registrationData = decoded;

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Token không hợp lệ', 400);
  }
};

module.exports = verifyRegistrationToken;