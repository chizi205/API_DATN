const { getIO } = require("../../socket");

const payosWebhookHandler = async (req, res) => {
  try {
    const webhookData = req.body;

    // Xác minh webhook
    const verifiedData = payos.verifyPaymentWebhookData(webhookData);

    if (verifiedData.code === "00") {
      const { orderCode, amount } = verifiedData.data;

      // Cập nhật hóa đơn thành công
      const updatedInvoice = await invoiceService.markAsPaid({
        invoice_id: orderCode,
        amount,
        payment_method: "payos",
      });

      if (updatedInvoice) {
        const io = getIO();

        // Gửi thông báo real-time
        io.to(`invoice_${updatedInvoice.id}`).emit("PAYMENT_SUCCESS", {
          invoice_id: updatedInvoice.id,
          invoice_code: updatedInvoice.invoice_code,
          status: "COMPLETED",
          final_amount: updatedInvoice.final_amount,
          paid_at: new Date(),
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("PayOS Webhook Error:", error);
    return res.status(500).json({ success: false });
  }
};