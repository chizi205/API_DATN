const selfPaymentService = require("../../services/members/selfPayment.service");
const ApiResponse = require("../../utils/response");

class SelfPaymentController {
  async previewPayment(req, res) {
    try {
      const { token, voucher_code } = req.query;
      const memberId = req.user.id;

      if (!token) {
        return ApiResponse.error(res, "Thiếu token thanh toán", 400);
      }

      const result = await selfPaymentService.previewPayment(token, memberId, voucher_code || null);
      return ApiResponse.success(
        res,
        result,
        "Lấy thông tin xem trước thanh toán thành công"
      );
    } catch (error) {
      console.error("[Preview Payment Error]", error);
      const statusCode = error.statusCode || 400;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  async checkoutPayment(req, res) {
    try {
      const { token, voucher_code, payment_method_id } = req.body;
      const memberId = req.user.id;

      if (!token) {
        return ApiResponse.error(res, "Thiếu token thanh toán", 400);
      }

      const result = await selfPaymentService.checkoutPayment(
        token,
        memberId,
        voucher_code || null,
        payment_method_id ? parseInt(payment_method_id) : null
      );

      return ApiResponse.success(res, result, result.message || "Checkout thành công");
    } catch (error) {
      console.error("[Checkout Payment Error]", error);
      const statusCode = error.statusCode || 400;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new SelfPaymentController();
