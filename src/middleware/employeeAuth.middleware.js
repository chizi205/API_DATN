const { verifyAccessToken } = require("../utils/jwt");
const ApiResponse = require("../utils/response");
const employeeRepository = require("../repositories/employees/auth.repositories"); // điều chỉnh path nếu cần

const authenticateEmployee = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.error(
        res,
        "Thiếu hoặc sai định dạng Authorization header",
        401,
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return ApiResponse.error(
        res,
        "Access token không hợp lệ hoặc đã hết hạn",
        401,
      );
    }

    req.employee = decoded;

    next();
  } catch (error) {
    console.error("Employee Auth Middleware Error:", error);
    return ApiResponse.error(res, "Xác thực nhân viên thất bại", 401);
  }
};

module.exports = authenticateEmployee;
