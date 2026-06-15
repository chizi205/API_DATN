const PayOS = require("@payos/node");

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY,
);

const createPayOSPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Hóa đơn không tồn tại" });
    }

    const paymentData = {
      orderCode: Number(invoice.id),
      amount: Number(invoice.final_amount),
      description: `Thanh toan ${invoice.invoice_code}`,
      returnUrl: `${process.env.FRONTEND_URL}/payment-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment-cancel`,
    };

    const paymentLink = await payos.createPaymentLink(paymentData);

    return res.json({
      success: true,
      data: {
        checkoutUrl: paymentLink.checkoutUrl, 
        qrCode: paymentLink.qrCode, 
        orderCode: paymentLink.orderCode,
      },
    });
  } catch (error) {
    console.error("Create PayOS Payment Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
