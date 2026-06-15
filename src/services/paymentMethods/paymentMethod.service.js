const paymentMethodRepo = require("../../repositories/paymentMethods/paymentMethod.repository");

class PaymentMethodService {
  async getAllActivePaymentMethods() {
    return await paymentMethodRepo.getAllActive();
  }

  async getAllPaymentMethods() {
    return await paymentMethodRepo.getAll();
  }

  async getPaymentMethodById(id) {
    const method = await paymentMethodRepo.findById(id);
    if (!method) {
      throw new Error("Không tìm thấy phương thức thanh toán");
    }
    return method;
  }
}

module.exports = new PaymentMethodService();