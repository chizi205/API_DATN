const bcrypt = require("bcryptjs");
const employeeRepository = require("../../repositories/employees/auth.repositories"); // điều chỉnh path đúng
const { createAccessToken } = require("../../utils/jwt");

class EmployeeAuthService {
  async login(identifier, password) {
    if (!identifier || !password) {
      throw new Error("Vui lòng nhập mã nhân viên/email và mật khẩu");
    }

    const employee = await employeeRepository.findForLogin(identifier);

    if (!employee) {
      throw new Error("Mã nhân viên hoặc email không tồn tại");
    }

    /*if (!employee.password) {
      throw new Error("Tài khoản chưa được thiết lập mật khẩu");
    }

    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      throw new Error("Mật khẩu không chính xác");
    }*/

    const accessToken = createAccessToken({
      id: employee.id,
      employee_code: employee.employee_code,
      role: employee.role,
      branch_id: employee.branch_id,
    });

    return {
      access_token: accessToken,
      employee: {
        id: employee.id,
        employee_code: employee.employee_code,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        branch_id: employee.branch_id,
        branch_name: employee.branch_name,
      },
    };
  }
}

module.exports = new EmployeeAuthService();
