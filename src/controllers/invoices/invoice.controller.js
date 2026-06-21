const invoiceService = require("../../services/invoices/invoice.service");
const ApiResponse = require("../../utils/response");

class InvoiceController {
  async createDraftInvoice(req, res) {
    try {
      const employee_id = req.employee?.id;
      const branch_id = req.employee?.branch_id;

      if (!employee_id || !branch_id) {
        return ApiResponse.error(
          res,
          "Không xác định được nhân viên hoặc chi nhánh",
          401,
        );
      }
      const data = {
        employee_id,
        branch_id,
        member_id: req.body.member_id || null,
        table_number: req.body.table_number || null,
        tax_amount: req.body.tax_amount || 0,
        service_charge: req.body.service_charge || 0,
        points_multiplier: req.body.points_multiplier || 1.0,
        items: req.body.items,
      };

      const invoice = await invoiceService.createDraftInvoice(data);

      return ApiResponse.success(res, invoice, "Tạo hóa đơn nháp thành công");
    } catch (error) {
      console.error("[Create Draft Invoice Error]", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async checkoutInvoice(req, res) {
    try {
      const { id } = req.params;
      const { payment_method_id } = req.body;

      if (!payment_method_id) {
        return ApiResponse.error(
          res,
          "Vui lòng chọn phương thức thanh toán",
          400,
        );
      }

      const result = await invoiceService.checkoutInvoice(
        parseInt(id),
        parseInt(payment_method_id),
      );

      if (result.type === "cash") {
        return ApiResponse.success(
          res,
          result,
          "Thanh toán tiền mặt thành công",
        );
      } else if (result.type === "payos") {
        return ApiResponse.success(
          res,
          result,
          "Tạo link thanh toán PayOS thành công",
        );
      }

      return ApiResponse.success(res, result, "Checkout thành công");
    } catch (error) {
      console.error("[Checkout Controller Error]", error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.getInvoiceById(id);

      return ApiResponse.success(res, null, "Lấy hóa đơn thành công");
    } catch (error) {
      console.error("[Get Invoice Error]", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
  async linkMemberToInvoice(req, res) {
    try {
      const { invoiceId } = req.params;
      const { member_id } = req.body;

      if (!member_id) {
        return ApiResponse.error(res, "member_id là bắt buộc", 400);
      }

      const result = await invoiceService.linkMemberToInvoice(
        invoiceId,
        member_id,
      );

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      console.error("[Link Member To Invoice Error]", error);
      return ApiResponse.error(res, error.message, 400);
    }
  }
  async cancelDraft(req, res) {
    try {
      const { id } = req.params;

      const result = await invoiceService.cancelDraftInvoice(id);

      res.json({
        success: true,
        message: "Hủy hóa đơn thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async getMyInvoicesToday(req, res, next) {
    try {
      const user = req.employee;

      if (!user.id) {
        return res.status(400).json({
          success: false,
          message: "Không tìm thấy thông tin nhân viên trong token",
        });
      }

      // Dùng lại findAll với today + employee_id từ token
      const filters = {
        today: true,
        employee_id: user.id,
        branch_id: user.branch_id, // có thể bỏ nếu muốn xem tất cả chi nhánh
        limit: req.query.limit || 20,
        last_id: req.query.last_id ? parseInt(req.query.last_id) : null,
        status: "COMPLETED",
        sort_order: req.query.sort_order || "DESC",
      };

      const result = await invoiceService.getInvoices(filters);

      res.status(200).json({
        success: true,
        message: "Lấy hóa đơn của bạn trong ngày thành công",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
  async findInvoiceById(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.employee;

      const invoice = await invoiceService.findInvoiceDetail(id);

      res.status(200).json({
        success: true,
        message: "Lấy chi tiết hóa đơn thành công",
        data: invoice,
      });
    } catch (error) {
      if (error.message === "Hóa đơn không tồn tại") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

module.exports = new InvoiceController();
