const paymentMethodService = require("../../services/paymentMethods/paymentMethod.service");
const ApiResponse = require("../../utils/response");

class PaymentMethodController {
  async getAllActive(req, res) {
    try {
      const methods = await paymentMethodService.getAllActivePaymentMethods();
      return ApiResponse.success(
        res,
        methods,
        "Lấy danh sách phương thức thanh toán thành công",
      );
    } catch (error) {
      console.error("[Get Payment Methods Error]", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async getAll(req, res) {
    try {
      const methods = await paymentMethodService.getAllPaymentMethods();
      return ApiResponse.success(
        res,
        methods,
        "Lấy danh sách phương thức thanh toán thành công",
      );
    } catch (error) {
      console.error("[Get All Payment Methods Error]", error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new PaymentMethodController();
