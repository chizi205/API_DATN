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


  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;
      //const invoice = await invoiceService.getInvoiceById(id);

      return ApiResponse.success(res, null, "Lấy hóa đơn thành công");
    } catch (error) {
      console.error("[Get Invoice Error]", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new InvoiceController();
