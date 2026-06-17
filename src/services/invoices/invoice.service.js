const pool = require("../../config/database");
const invoiceRepo = require("../../repositories/invoices/invoice.repository");
const infoRepository = require("../../repositories/members/info.repositories");
const paymentMethodRepo = require("../../repositories/paymentMethods/paymentMethod.repository");
const pointTransactionService = require("../../services/pointTransactions/pointTransaction.service");
const deviceService = require("../../services/members/device.service");
const payOsService = require("../external/payos.service");
class InvoiceService {
  async createDraftInvoice(data) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let subTotal = 0;
      const items = data.items.map((item) => {
        const itemTotal = item.quantity * item.unit_price;
        subTotal += itemTotal;
        return {
          invoice_id: null,
          product_id: item.product_id || null,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        };
      });

      let pointsMultiplier = data.points_multiplier || 1.0;

      if (data.member_id) {
        const memberTier = await infoRepository.getMemberPointsMultiplier(
          data.member_id,
          client,
        );

        if (memberTier) {
          pointsMultiplier = memberTier.point_multiplier || 1.0;
        }
      }

      const pointConfigs = await invoiceRepo.getActivePointConfig(client);
      let pointsEarned = 0;

      if (pointConfigs.length > 0) {
        const config = pointConfigs[0];
        pointsEarned =
          Math.floor(subTotal / config.spend_amount) * config.earn_points;
      }

      const finalAmount =
        subTotal + (data.tax_amount || 0) + (data.service_charge || 0);

      const invoiceData = {
        employee_id: data.employee_id,
        branch_id: data.branch_id,
        member_id: data.member_id || null,
        table_number: data.table_number || null,
        sub_total: subTotal,
        discount_amount: 0,
        voucher_discount: 0,
        final_amount: finalAmount,
        points_earned: pointsEarned,
        points_multiplier: pointsMultiplier,
        status: "DRAFT",
        tax_amount: data.tax_amount || 0,
        service_charge: data.service_charge || 0,
      };

      const invoice = await invoiceRepo.create(invoiceData, client);

      const detailsWithInvoiceId = items.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      }));

      await invoiceRepo.createManyInvoiceDetails(detailsWithInvoiceId, client);

      await client.query("COMMIT");

      return {
        ...invoice,
        items: detailsWithInvoiceId,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async checkoutInvoice(invoiceId, paymentMethodId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const invoice = await invoiceRepo.findById(invoiceId, client);
      if (!invoice) throw new Error("Hóa đơn không tồn tại");
      if (invoice.status === "COMPLETED")
        throw new Error("Hóa đơn đã được thanh toán");

      const paymentMethod = await paymentMethodRepo.findById(
        paymentMethodId,
        client,
      );
      if (!paymentMethod || !paymentMethod.is_active) {
        throw new Error("Phương thức thanh toán không hợp lệ");
      }

      if (paymentMethod.code === "cash") {
        const updatedInvoice = await invoiceRepo.markAsPaid(
          invoiceId,
          paymentMethod.code,
          paymentMethodId,
          client,
        );

        if (updatedInvoice.member_id && updatedInvoice.points_earned > 0) {
          const finalPoints = Math.floor(
            updatedInvoice.points_earned *
              (updatedInvoice.points_multiplier || 1),
          );

          if (finalPoints > 0) {
            await infoRepository.addPoints(
              updatedInvoice.member_id,
              finalPoints,
              client,
            );

            await pointTransactionService.createEarnTransaction(
              {
                member_id: updatedInvoice.member_id,
                points: finalPoints,
                multiplier_applied: updatedInvoice.points_multiplier,
                reference_type: "invoice",
                reference_id: updatedInvoice.id,
                description: `Tích điểm từ hóa đơn ${updatedInvoice.invoice_code}`,
              },
              client,
            );

            await client.query("COMMIT");

            await deviceService.sendNotificationToUser(
              updatedInvoice.member_id,
              "Thanh toán thành công",
              `Hóa đơn ${updatedInvoice.invoice_code} đã được thanh toán, bạn được cộng ${finalPoints} điểm.`,
              {
                invoice_id: updatedInvoice.id,
                type: "payment_success",
              },
            );
          }
        }

        return {
          type: "cash",
          message: "Thanh toán tiền mặt thành công",
          invoice: updatedInvoice,
        };
      }

      if (paymentMethod.code === "payos") {
        await client.query("COMMIT");

        const paymentLink = await payOsService.createPaymentLink(invoice);

        await invoiceRepo.updatePaymentMethod(
          invoiceId,
          paymentMethod.code,
          paymentMethodId,
          client,
        );

        return {
          type: "payos",
          message: "Tạo link thanh toán PayOS thành công",
          checkout_url: paymentLink.checkoutUrl,
          qr_code: paymentLink.qrCode,
          order_code: paymentLink.orderCode,
          invoice_id: invoice.id,
        };
      }

      throw new Error("Phương thức thanh toán chưa được hỗ trợ");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async getInvoiceById(id) {
    const invoice = await invoiceRepo.findById(id);

    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    const items = await invoiceRepo.getInvoiceDetails(id);

    return {
      ...invoice,
      items: items || [],
    };
  }
  async markAsPaidFromPayOS(invoiceId, amount) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    if (invoice.status === "COMPLETED") {
      throw new Error("Hóa đơn đã được thanh toán");
    }

    const payosMethod = await paymentMethodRepo.findByCode("payos");
    if (!payosMethod) {
      throw new Error("Phương thức thanh toán PayOS không tồn tại");
    }

    const updatedInvoice = await invoiceRepo.markAsPaid(
      invoiceId,
      payosMethod.code,
      payosMethod.id,
    );

    return updatedInvoice;
  }
  async markInvoiceAsFailed(invoiceId) {
    const invoice = await invoiceRepo.findById(invoiceId);

    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    if (invoice.status === "COMPLETED") {
      throw new Error("Hóa đơn đã được thanh toán, không thể đánh dấu thất bại");
    }

    const updatedInvoice = await invoiceRepo.markAsFailed(invoiceId);
    return updatedInvoice;
  }
}

module.exports = new InvoiceService();
