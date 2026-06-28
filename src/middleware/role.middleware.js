const ApiResponse = require("../utils/response");

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return ApiResponse.unauthorized(res, "Bạn chưa đăng nhập");
    }

    if (!allowedRoles.includes(req.employee.role)) {
      return ApiResponse.forbidden(res, "Bạn không có quyền truy cập chức năng này");
    }

    next();
  };
};

module.exports = authorizeRoles;
