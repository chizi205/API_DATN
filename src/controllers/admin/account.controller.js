const bcrypt = require("bcryptjs");
const accountRepository = require("../../repositories/admin/account.repository");
const ApiResponse = require("../../utils/response");

class AccountController {
  async getEmployees(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const employees = await accountRepository.getAllEmployees(limit, offset);
      return ApiResponse.success(res, employees, "Lấy danh sách tài khoản thành công");
    } catch (error) {
      console.error("Get Employees Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy danh sách tài khoản");
    }
  }

  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await accountRepository.findById(id);

      if (!employee) {
        return ApiResponse.notFound(res, "Tài khoản nhân viên không tồn tại");
      }

      return ApiResponse.success(res, employee, "Lấy thông tin tài khoản thành công");
    } catch (error) {
      console.error("Get Employee By ID Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy chi tiết tài khoản");
    }
  }

  async createEmployee(req, res) {
    try {
      const { employee_code, full_name, email, password, role, branch_id, is_active } = req.body;

      if (!employee_code || !full_name || !email || !password) {
        return ApiResponse.error(res, "Vui lòng nhập đầy đủ mã nhân viên, họ tên, email và mật khẩu", 400);
      }

      const existing = await accountRepository.findByEmailOrCode(email, employee_code);
      if (existing) {
        return ApiResponse.error(res, "Email hoặc mã nhân viên đã được sử dụng", 400);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newEmployee = await accountRepository.createEmployee({
        employee_code,
        full_name,
        email,
        password: hashedPassword,
        role,
        branch_id,
        is_active,
      });

      return ApiResponse.created(res, newEmployee, "Tạo tài khoản nhân viên thành công");
    } catch (error) {
      console.error("Create Employee Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi tạo tài khoản");
    }
  }

  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { full_name, email, password, role, branch_id, is_active } = req.body;

      const employee = await accountRepository.findById(id);
      if (!employee) {
        return ApiResponse.notFound(res, "Tài khoản nhân viên không tồn tại");
      }

      const updateData = { full_name, email, role, branch_id, is_active };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedEmployee = await accountRepository.updateEmployee(id, updateData);
      return ApiResponse.success(res, updatedEmployee, "Cập nhật tài khoản thành công");
    } catch (error) {
      console.error("Update Employee Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật tài khoản");
    }
  }

  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;

      const employee = await accountRepository.findById(id);
      if (!employee) {
        return ApiResponse.notFound(res, "Tài khoản nhân viên không tồn tại");
      }

      await accountRepository.deleteEmployee(id);
      return ApiResponse.success(res, null, "Vô hiệu hóa tài khoản nhân viên thành công");
    } catch (error) {
      console.error("Delete Employee Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi vô hiệu hóa tài khoản");
    }
  }
}

module.exports = new AccountController();
