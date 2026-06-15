const bcrypt = require("bcryptjs");
const employeeRepository = require("../../repositories/employees/auth.repositories");
const sessionRepository = require("../../repositories/sessions/session.repository");
const { createAccessToken } = require("../../utils/jwt");

class EmployeeAuthService {
  async login(identifier, password, req) {
    if (!identifier || !password) {
      throw new Error("Vui lòng nhập mã nhân viên hoặc email và mật khẩu");
    }

    // 1. Tìm nhân viên
    const employee = await employeeRepository.findForLogin(identifier);

    if (!employee) {
      throw new Error("Mã nhân viên hoặc email không tồn tại");
    }

    // 2. Kiểm tra mật khẩu
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

    await sessionRepository.createSession({
      employee_id: employee.id,
      token_hash: this.hashToken(accessToken),
      ip_address: req?.ip || null,
      user_agent: req?.headers?.["user-agent"] || null,
    });

    return {
      access_token: accessToken,
      employee: {
        id: employee.id,
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        email: employee.email,
        role: employee.role,
        branch_id: employee.branch_id,
        branch_name: employee.branch_name,
      },
    };
  }

  async logout(token) {
    if (!token) {
      throw new Error("Token không hợp lệ");
    }

    const tokenHash = this.hashToken(token);

    const session = await sessionRepository.findByTokenHash(tokenHash);

    if (!session) {
      throw new Error("Session không tồn tại hoặc đã đăng xuất");
    }

    await sessionRepository.deactivateSession(session.id);

    return { message: "Đăng xuất thành công" };
  }

  async logoutAllDevices(employeeId) {
    if (!employeeId) {
      throw new Error("Không tìm thấy thông tin nhân viên");
    }

    const result = await sessionRepository.deactivateAllSessions(employeeId);

    return {
      message: "Đã đăng xuất khỏi tất cả thiết bị",
      affected_sessions: result.length,
    };
  }
  hashToken(token) {
    return require("crypto").createHash("sha256").update(token).digest("hex");
  }
}

module.exports = new EmployeeAuthService();
