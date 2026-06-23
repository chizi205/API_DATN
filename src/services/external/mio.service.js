const axios = require("axios");

const createPaymentLink = async (invoice, paymentMethod) => {
  try {
    if (paymentMethod.code !== "mio") {
      throw new Error("Chỉ hỗ trợ phương thức thanh toán Mió");
    }

    const orderCode = Number(invoice.id) * 1000 + (Date.now() % 1000);
    const amount = Math.round(Number(invoice.final_amount));

    const config = paymentMethod.config;

    if (!config || !config.api_url || !config.api_key) {
      throw new Error(
        "Cấu hình thanh toán Mió chưa đầy đủ (thiếu api_url hoặc api_key)",
      );
    }

    const payload = {
      amount: amount,
      description: `Thanh toán hóa đơn ${invoice.invoice_code}`,
      merchant_order_id: orderCode,
   
    };

    const response = await axios.post(config.api_url, payload, {
      headers: {
        "x-api-key": config.api_key,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
    return response.data.data;
  } catch (error) {
    console.error("Mió Payment Error:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Tạo thanh toán Mio thất bại",
    );
  }
};

module.exports = {
  createPaymentLink,
};
