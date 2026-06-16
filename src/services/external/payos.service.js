const axios = require("axios");
const crypto = require("crypto");
const invoiceService = require("../invoices/invoice.service");

const createPaymentLink = async (invoice) => {
  const orderCode = Number(invoice.id);
  const amount = Math.round(Number(invoice.final_amount));

  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Số tiền không hợp lệ: ${invoice.final_amount}`);
  }
  if (amount < 1000) {
    throw new Error(`Số tiền quá nhỏ (tối thiểu 1000 VNĐ)`);
  }

  const body = {
    orderCode: orderCode,
    amount: amount,
    description: `INV-${invoice.invoice_code}`.slice(0, 25),
    returnUrl: `${process.env.PUBLIC_URL}/payment-success`,
    cancelUrl: `${process.env.PUBLIC_URL}/payment-cancel`,
  };

  const signData = [
    `amount=${body.amount}`,
    `cancelUrl=${body.cancelUrl}`,
    `description=${body.description}`,
    `orderCode=${body.orderCode}`,
    `returnUrl=${body.returnUrl}`,
  ].join("&");

  const signature = crypto
    .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
    .update(signData)
    .digest("hex");

  const bodyWithSignature = {
    ...body,
    signature,
  };

  try {
    const res = await axios.post(
      "https://api-merchant.payos.vn/v2/payment-requests",
      bodyWithSignature,
      {
        headers: {
          "x-client-id": process.env.PAYOS_CLIENT_ID,
          "x-api-key": process.env.PAYOS_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.data || res.data.code !== "00") {
      throw new Error(res.data?.desc || "Lỗi từ PayOS");
    }

    return res.data.data;
  } catch (err) {
    console.error("PayOS Error:", err.response?.data || err.message);
    throw new Error(
      err.response?.data?.desc ||
        err.message ||
        "Lỗi khi tạo link thanh toán PayOS",
    );
  }
};

module.exports = {
  createPaymentLink,
};
