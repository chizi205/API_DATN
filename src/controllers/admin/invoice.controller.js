const invoiceService = require("../../services/admin/invoice.service");
const ApiResponse = require("../../utils/response");

class InvoiceController {
  async getInvoices(req, res) {
    try {
      const result = await invoiceService.getInvoices(req.query);
      return ApiResponse.success(res, result, "Lấy danh sách hóa đơn thành công");
    } catch (error) {
      console.error("Get Invoices Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy danh sách hóa đơn");
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const result = await invoiceService.getInvoiceById(id);
      return ApiResponse.success(res, result, "Lấy chi tiết hóa đơn thành công");
    } catch (error) {
      console.error("Get Invoice By ID Error:", error);
      if (error.message === "Hóa đơn không tồn tại") {
        return ApiResponse.notFound(res, error.message);
      }
      return ApiResponse.serverError(res, "Lỗi server khi lấy chi tiết hóa đơn");
    }
  }

  async updateInvoiceStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, "Vui lòng truyền trạng thái hóa đơn", 400);
      }

      const updatedInvoice = await invoiceService.updateInvoiceStatus(id, status);
      return ApiResponse.success(res, updatedInvoice, "Cập nhật trạng thái hóa đơn thành công");
    } catch (error) {
      console.error("Update Invoice Status Error:", error);
      if (error.message === "Hóa đơn không tồn tại") {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes("không hợp lệ")) {
        return ApiResponse.error(res, error.message, 400);
      }
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật trạng thái hóa đơn");
    }
  }
}

module.exports = new InvoiceController();
