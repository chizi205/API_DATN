const EmployeeAuthService = require("../../services/employees/auth.service");
const ApiResponse = require("../../utils/response");

const loginController = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const result = await EmployeeAuthService.login(identifier, password);

    return ApiResponse.success(res, result, "Đăng nhập thành công");
  } catch (error) {
    console.error("Employee Login Controller Error:", error);
    return ApiResponse.error(res, error.message, 401);
  }
};

module.exports = {
  loginController,
};
