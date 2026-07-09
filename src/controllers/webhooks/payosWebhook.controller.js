const invoiceService = require("../../services/invoices/invoice.service");
const memberRepo = require("../../repositories/members/info.repositories");
const pointTransactionRepo = require("../../repositories/pointTransactions/pointTransaction.repository");
const deviceService = require("../../services/members/device.service");
const { getIO } = require("../../socket");
const ApiResponse = require("../../utils/response");
const pool = require("../../config/database");

class PayosWebhookController {
  async handleWebhook(req, res) {
    try {
      const webhookPayload = req.body;

      if (!webhookPayload?.data?.orderCode) {
        console.warn("Invalid PayOS payload structure");
        return res.status(400).json({ message: "Invalid payload" });
      }

      const orderCode = webhookPayload.data.orderCode;
      const invoiceId = Math.floor(Number(orderCode) / 1000);
      const isPaid =
        webhookPayload.success && webhookPayload.data.code === "00";

      const invoice = await invoiceService.getInvoiceById(invoiceId);
      if (!invoice) {
        console.log(`Invoice ${invoiceId} not found`);
        return res.status(200).json({ message: "OK - acknowledged" });
      }

      if (invoice.status === "COMPLETED") {
        return res.status(200).json({ message: "Already processed" });
      }

      const io = getIO();

      if (isPaid) {
        const client = await pool.connect();

        try {
          await client.query("BEGIN");

          const updatedInvoice = await invoiceService.markAsPaidFromPayOS(
            invoiceId,
            webhookPayload.data.amount,
            client,
          );
          let finalPoints = 0;

          if (updatedInvoice.member_id && updatedInvoice.points_earned > 0) {
            finalPoints = Math.floor(
              updatedInvoice.points_earned *
              (updatedInvoice.points_multiplier || 1),
            );

            if (finalPoints > 0) {
              await memberRepo.addPoints(
                updatedInvoice.member_id,
                finalPoints,
                client,
              );

              await pointTransactionRepo.createTransaction(
                {
                  member_id: updatedInvoice.member_id,
                  transaction_type: "EARN",
                  points: finalPoints,
                  multiplier_applied: updatedInvoice.points_multiplier || 1,
                  reference_type: "INVOICE",
                  reference_id: updatedInvoice.id,
                  description: `Tích điểm từ hóa đơn ${updatedInvoice.invoice_code} (PayOS)`,
                },
                client,
              );
            }
          }

          await client.query("COMMIT");

          io.to(`invoice_${updatedInvoice.id}`).emit("PAYMENT_SUCCESS", {
            invoice_id: updatedInvoice.id,
            invoice_code: updatedInvoice.invoice_code,
            status: "COMPLETED",
            final_amount: updatedInvoice.final_amount,
            paid_at: new Date(),
          });

           if (updatedInvoice.member_id && updatedInvoice.points_earned > 0){
             try {
               await deviceService.sendNotificationToUser(
                 updatedInvoice.member_id,
                 "Thanh toán thành công",
                 `Hóa đơn ${updatedInvoice.invoice_code} đã được thanh toán, bạn được cộng ${finalPoints} điểm.`,
                 {
                   invoice_id: updatedInvoice.id,
                   type: "payment_success",
                 },
               );
             } catch (notiError) {
               console.error("Gửi thông báo thất bại:", notiError);
             }
           }


          console.log(
            `✅ Invoice ${invoiceId} đã thanh toán thành công qua PayOS`,
          );
        } catch (error) {
          await client.query("ROLLBACK");
          throw error;
        } finally {
          client.release();
        }
      } else {
        await invoiceService.markInvoiceAsFailed(invoiceId);

        io.to(`invoice_${invoiceId}`).emit("PAYMENT_FAILED", {
          invoice_id: invoiceId,
          status: "FAILED",
        });

        console.log(`❌ Invoice ${invoiceId} thanh toán thất bại`);
      }

      return res.status(200).json({ message: "OK" });
    } catch (error) {
      console.error("PayOS Webhook Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi xử lý webhook PayOS");
    }
  }
}

module.exports = new PayosWebhookController();
