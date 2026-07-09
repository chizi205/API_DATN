const pool = require("../../config/database");
const invoiceRepo = require("../../repositories/invoices/invoice.repository");
const infoRepository = require("../../repositories/members/info.repositories");
const paymentMethodRepo = require("../../repositories/paymentMethods/paymentMethod.repository");
const pointTransactionService = require("../../services/pointTransactions/pointTransaction.service");
const deviceService = require("../../services/members/device.service");
const payOsService = require("../external/payos.service");
const miOService = require("../external/mio.service");
const voucherRepository = require("../../repositories/members/voucher.repository");
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

      const finalAmount =
        subTotal + (data.tax_amount || 0) + (data.service_charge || 0);

      const crypto = require("crypto");
      let claimQrToken = null;
      let claimQrExpiredAt = null;

      if (!data.member_id) {
        claimQrToken = crypto.randomUUID();
        claimQrExpiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Tạo hóa đơn (chỉ tạo, chưa tính điểm)
      const invoiceData = {
        employee_id: data.employee_id,
        branch_id: data.branch_id,
        member_id: data.member_id || null,
        table_number: data.table_number || null,
        sub_total: subTotal,
        discount_amount: 0,
        voucher_discount: 0,
        final_amount: finalAmount,
        points_earned: 0, // Mặc định = 0
        points_multiplier: 1.0, // Mặc định = 1.0
        status: "DRAFT",
        tax_amount: data.tax_amount || 0,
        service_charge: data.service_charge || 0,
        claim_qr_token: claimQrToken,
        claim_qr_expired_at: claimQrExpiredAt,
      };

      const invoice = await invoiceRepo.create(invoiceData, client);

      // Tạo chi tiết hóa đơn
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
        let finalPoints;
        if (updatedInvoice.member_id && updatedInvoice.points_earned > 0) {
          finalPoints = Math.floor(
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
          }
        }

        await client.query("COMMIT");

        // Notify socket
        try {
          const { getIO } = require("../../socket");
          const io = getIO();
          io.to(`invoice_${updatedInvoice.id}`).emit("PAYMENT_SUCCESS", {
            invoice_id: updatedInvoice.id,
            invoice_code: updatedInvoice.invoice_code,
            status: "COMPLETED",
            final_amount: updatedInvoice.final_amount,
            paid_at: new Date(),
          });
        } catch (socketError) {
          console.error("Socket error (non-fatal):", socketError);
        }

        if (updatedInvoice.member_id && updatedInvoice.points_earned > 0) {
          try {
            await deviceService.sendNotificationToUser(
              updatedInvoice.member_id,
              "Thanh toán thành công",
              `Hóa đơn ${updatedInvoice.invoice_code} đã được thanh toán, bạn được cộng ${finalPoints || 0} điểm.`,
              {
                invoice_id: updatedInvoice.id,
                type: "payment_success",
              },
            );
          } catch (notiError) {
            console.error(
              "Gửi thông báo thất bại (không ảnh hưởng giao dịch):",
              notiError,
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
        await invoiceRepo.updatePaymentMethod(
          invoiceId,
          paymentMethod.code,
          paymentMethodId,
          client,
        );
        await client.query("COMMIT");

        const paymentLink = await payOsService.createPaymentLink(invoice);

        return {
          type: "payos",
          message: "Tạo link thanh toán PayOS thành công",
          checkout_url: paymentLink.checkoutUrl,
          qr_code: paymentLink.qrCode,
          order_code: paymentLink.orderCode,
          invoice_id: invoice.id,
        };
      }

      if (paymentMethod.code === "mio") {
        await invoiceRepo.updatePaymentMethod(
          invoiceId,
          paymentMethod.code,
          paymentMethodId,
          client,
        );

        await client.query("COMMIT");

        const paymentLink = await miOService.createPaymentLink(
          invoice,
          paymentMethod,
        );

        return {
          type: "mio",
          message: "Tạo link thanh toán MiO thành công",
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
  async markAsPaidFromPayOS(invoiceId, amount, client = null) {
    const payosMethod = await paymentMethodRepo.findByCode("payos", client);
    if (!payosMethod) {
      throw new Error("Phương thức thanh toán PayOS không tồn tại");
    }

    const updatedInvoice = await invoiceRepo.markAsPaid(
      invoiceId,
      payosMethod.code,
      payosMethod.id,
      client,
    );

    return updatedInvoice;
  }

  async markAsPaidFromMio(invoiceId, amount, client = null) {
    const mioMethod = await paymentMethodRepo.findByCode("mio", client);
    if (!mioMethod) {
      throw new Error("Phương thức thanh toán MIO không tồn tại");
    }

    const updatedInvoice = await invoiceRepo.markAsPaid(
      invoiceId,
      mioMethod.code,
      mioMethod.id,
      client,
    );

    return updatedInvoice;
  }
  async markInvoiceAsFailed(invoiceId) {
    const invoice = await invoiceRepo.findById(invoiceId);

    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    if (invoice.status === "COMPLETED") {
      throw new Error(
        "Hóa đơn đã được thanh toán, không thể đánh dấu thất bại",
      );
    }

    const updatedInvoice = await invoiceRepo.markAsFailed(invoiceId);
    return updatedInvoice;
  }
  async linkMemberToInvoice(invoiceId, memberId) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const invoice = await invoiceRepo.findById(invoiceId, client);
      if (!invoice) {
        throw new Error("Hóa đơn không tồn tại");
      }

      if (invoice.status !== "DRAFT") {
        throw new Error(
          "Chỉ được gán thành viên cho hóa đơn ở trạng thái DRAFT",
        );
      }

      if (invoice.member_id) {
        throw new Error("Hóa đơn này đã có thành viên");
      }

      const memberTier = await infoRepository.getMemberPointsMultiplier(
        memberId,
        client,
      );

      const pointsMultiplier = memberTier?.point_multiplier || 1.0;

      const pointConfigs = await invoiceRepo.getActivePointConfig(client);
      let pointsEarned = 0;

      if (pointConfigs.length > 0) {
        const config = pointConfigs[0];
        pointsEarned =
          Math.floor(invoice.final_amount / config.spend_amount) *
          config.earn_points;
      }

      const updatedInvoice = await invoiceRepo.updateMemberAndPoints(
        invoiceId,
        memberId,
        pointsMultiplier,
        pointsEarned,
        client,
      );

      await client.query("COMMIT");

      console.log(
        `Đã gán member_id=${memberId} vào hóa đơn ${invoice.invoice_code}`,
      );

      return {
        success: true,
        message: "Gán thành viên vào hóa đơn thành công",
        invoice: updatedInvoice,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async cancelDraftInvoice(invoiceId, cancelledBy, reason = null) {
    const invoice = await invoiceRepo.findById(invoiceId);
    if (!invoice) {
      throw new AppError("Hóa đơn không tồn tại", 404);
    }

    if (invoice.status !== "DRAFT") {
      throw new AppError(
        `Không thể hủy hóa đơn ở trạng thái "${invoice.status}". Chỉ hủy được hóa đơn DRAFT.`,
        400,
      );
    }

    const cancelledInvoice = await invoiceRepo.cancelDraft(
      invoiceId,
      cancelledBy,
      reason,
    );

    if (!cancelledInvoice) {
      throw new AppError("Hủy hóa đơn thất bại", 500);
    }

    return cancelledInvoice;
  }
  async getInvoices(filters) {
    return await invoiceRepo.findAll(filters);
  }
  async findInvoiceDetail(invoiceId) {
    const invoice = await invoiceRepo.findDetailById(invoiceId);

    if (!invoice) {
      throw new Error("Hóa đơn không tồn tại");
    }

    return invoice;
  }

  async applyVoucherToInvoice(invoiceId, voucherCode) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Fetch invoice
      const invoice = await invoiceRepo.findById(invoiceId, client);
      if (!invoice) {
        throw new Error("INVOICE_NOT_FOUND");
      }

      if (invoice.status !== "DRAFT") {
        throw new Error("INVOICE_NOT_DRAFT");
      }

      // 2. Fetch member voucher
      const memberVoucher = await voucherRepository.getMemberVoucherByCode(
        voucherCode,
        client,
      );
      if (!memberVoucher) {
        throw new Error("VOUCHER_NOT_FOUND");
      }

      if (memberVoucher.status !== "AVAILABLE") {
        throw new Error("VOUCHER_ALREADY_USED_OR_EXPIRED");
      }

      // Check expiry date
      const today = new Date().toISOString().slice(0, 10);
      const expiryDateStr = new Date(memberVoucher.expiry_date)
        .toISOString()
        .slice(0, 10);
      if (expiryDateStr < today) {
        throw new Error("VOUCHER_EXPIRED");
      }

      // 3. Calculate discount
      const subTotal = Number(invoice.sub_total);
      let voucherDiscount = 0;

      if (memberVoucher.discount_type === "FIXED") {
        voucherDiscount = Math.min(
          Number(memberVoucher.discount_value),
          subTotal,
        );
      } else if (memberVoucher.discount_type === "PERCENT") {
        let pctDiscount =
          (subTotal * Number(memberVoucher.discount_value)) / 100;
        if (memberVoucher.max_discount) {
          pctDiscount = Math.min(
            pctDiscount,
            Number(memberVoucher.max_discount),
          );
        }
        voucherDiscount = Math.min(pctDiscount, subTotal);
      }

      // 4. Recalculate final_amount
      const discountAmount = Number(invoice.discount_amount || 0);
      const taxAmount = Number(invoice.tax_amount || 0);
      const serviceCharge = Number(invoice.service_charge || 0);

      const finalAmount = Math.max(
        0,
        subTotal - discountAmount - voucherDiscount + taxAmount + serviceCharge,
      );

      // 5. Recalculate points earned
      const pointConfigs = await invoiceRepo.getActivePointConfig(client);
      let pointsEarned = 0;

      if (pointConfigs.length > 0) {
        const config = pointConfigs[0];
        pointsEarned =
          Math.floor(finalAmount / Number(config.spend_amount)) *
          Number(config.earn_points);
      }

      // 6. Update database
      const updatedInvoice = await invoiceRepo.applyVoucherToInvoice(
        invoiceId,
        memberVoucher.id,
        voucherDiscount,
        finalAmount,
        pointsEarned,
        client,
      );

      await client.query("COMMIT");

      return updatedInvoice;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new InvoiceService();
