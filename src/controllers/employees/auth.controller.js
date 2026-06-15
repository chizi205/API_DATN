const EmployeeAuthService = require("../../services/employees/auth.service");
const ApiResponse = require("../../utils/response");

const loginController = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await EmployeeAuthService.login(identifier, password, req);

    return ApiResponse.success(res, result, "Đăng nhập thành công");
  } catch (error) {
    console.error("Employee Login Controller Error:", error);
    return ApiResponse.error(res, error.message, 401);
  }
};

const logoutController = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return ApiResponse.error(res, "Token không được cung cấp", 401);
    }

    const result = await EmployeeAuthService.logout(token);

    return ApiResponse.success(res, result, "Đăng xuất thành công");
  } catch (error) {
    console.error("Employee Logout Controller Error:", error);
    return ApiResponse.error(res, error.message, 400);
  }
};

module.exports = {
  loginController,
  logoutController
};
