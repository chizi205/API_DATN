const customerService = require("../../services/admin/customer.service");
const ApiResponse = require("../../utils/response");

class CustomerController {
  async getCustomers(req, res) {
    try {
      const result = await customerService.getCustomers(req.query);
      return ApiResponse.success(res, result, "Lấy danh sách khách hàng thành công");
    } catch (error) {
      console.error("Get Customers Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy danh sách khách hàng");
    }
  }

  async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const result = await customerService.getCustomerById(id);
      return ApiResponse.success(res, result, "Lấy chi tiết khách hàng thành công");
    } catch (error) {
      console.error("Get Customer By ID Error:", error);
      if (error.message === "Khách hàng không tồn tại") {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, "Lỗi server khi lấy chi tiết khách hàng");
    }
  }

  async createCustomer(req, res) {
    try {
      const newCustomer = await customerService.createCustomer(req.body);
      return ApiResponse.created(res, newCustomer, "Tạo khách hàng thành công");
    } catch (error) {
      console.error("Create Customer Error:", error);
      if (error.message.includes("Số điện thoại")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.serverError(res, "Lỗi server khi tạo khách hàng");
    }
  }

  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const updatedCustomer = await customerService.updateCustomer(id, req.body);
      return ApiResponse.success(res, updatedCustomer, "Cập nhật khách hàng thành công");
    } catch (error) {
      console.error("Update Customer Error:", error);
      if (error.message === "Khách hàng không tồn tại") {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes("Số điện thoại")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật khách hàng");
    }
  }

  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      const deletedCustomer = await customerService.deleteCustomer(id);
      return ApiResponse.success(res, deletedCustomer, "Vô hiệu hóa khách hàng thành công");
    } catch (error) {
      console.error("Delete Customer Error:", error);
      if (error.message === "Khách hàng không tồn tại") {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, "Lỗi server khi vô hiệu hóa khách hàng");
    }
  }
}

module.exports = new CustomerController();
