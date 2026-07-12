const pool = require("../../config/database");
const infoRepository = require("../../repositories/members/info.repositories");
const paymentMethodRepo = require("../../repositories/paymentMethods/paymentMethod.repository");
const voucherRepository = require("../../repositories/members/voucher.repository");
const invoiceRepo = require("../../repositories/invoices/invoice.repository");
const pointTransactionService = require("../pointTransactions/pointTransaction.service");
const deviceService = require("./device.service");
const payOsService = require("../external/payos.service");
const miOService = require("../external/mio.service");
const notificationRepository = require("../../repositories/members/notification.repository");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class SelfPaymentService {
  async previewPayment(token, memberId, voucherCode = null) {
    // Find invoice by token
    const queryInvoice = `
      SELECT * FROM invoices 
      WHERE claim_qr_token = $1;
    `;
    const { rows: invoiceRows } = await pool.query(queryInvoice, [token]);
    const invoice = invoiceRows[0];

    if (!invoice) {
      throw createError("Không tìm thấy hóa đơn hợp lệ với mã QR này", 404);
    }

    if (
      invoice.claim_qr_expired_at &&
      new Date(invoice.claim_qr_expired_at) < new Date()
    ) {
      throw createError("Mã QR đã hết hạn sử dụng", 400);
    }

    if (invoice.status === "CANCELLED") {
      throw createError("Hóa đơn này đã bị hủy", 400);
    }

    // CASE 1: Hóa đơn đã thanh toán nhưng chưa tích điểm -> Cho phép tích điểm
    if (invoice.status === "COMPLETED") {
      if (invoice.member_id !== null) {
        throw createError("Hóa đơn này đã được tích điểm trước đó", 400);
      }

      // Lấy cấu hình điểm đang hoạt động
      const queryConfig = `
        SELECT spend_amount, earn_points 
        FROM point_configs 
        WHERE is_active = true 
        ORDER BY spend_amount ASC 
        LIMIT 1;
      `;
      const { rows: configRows } = await pool.query(queryConfig);
      const config = configRows[0];

      if (!config) {
        throw createError("Hệ thống chưa cấu hình quy đổi điểm thưởng", 400);
      }

      const queryMember = `
        SELECT m.tier_id, t.point_multiplier 
        FROM members m
        LEFT JOIN membership_tiers t ON m.tier_id = t.id
        WHERE m.id = $1;
      `;
      const { rows: memberRows } = await pool.query(queryMember, [memberId]);
      const member = memberRows[0];

      if (!member) {
        throw createError("Không tìm thấy thông tin thành viên", 404);
      }

      const finalAmount = Number(invoice.final_amount);
      const spendAmount = Number(config.spend_amount);
      const earnPoints = Number(config.earn_points);
      const pointMultiplier = Number(member.point_multiplier || 1.0);

      const basePoints = Math.floor(finalAmount / spendAmount) * earnPoints;
      const expectedPoints = Math.floor(basePoints * pointMultiplier);

      return {
        action: "CLAIM_POINTS",
        invoice: {
          invoice_id: invoice.id,
          invoice_code: invoice.invoice_code,
          final_amount: finalAmount,
          expected_points: expectedPoints,
          point_multiplier: pointMultiplier,
          status: invoice.status,
        },
      };
    }

    // CASE 2: Hóa đơn chưa thanh toán (DRAFT) -> Cho phép tự thanh toán
    if (invoice.status === "DRAFT"|| invoice.status === "PENDING") {
      // Get invoice details
      const items = await invoiceRepo.getInvoiceDetails(invoice.id);

      let voucherDiscount = 0;
      let finalAmount = Number(invoice.final_amount);
      let pointsEarned = Number(invoice.points_earned);
      let appliedMemberVoucherId = null;

      if (voucherCode) {
        const queryVoucher = `
          SELECT mv.*, v.discount_type, v.discount_value, v.max_discount
          FROM member_vouchers mv
          LEFT JOIN vouchers v ON mv.voucher_id = v.id
          WHERE mv.voucher_code = $1 AND mv.member_id = $2;
        `;
        const { rows: voucherRows } = await pool.query(queryVoucher, [voucherCode, memberId]);
        const memberVoucher = voucherRows[0];

        if (!memberVoucher) {
          throw createError("Voucher không hợp lệ hoặc không thuộc về thành viên này", 400);
        }

        if (memberVoucher.status !== "AVAILABLE") {
          throw createError("Voucher này đã được sử dụng hoặc đã hết hạn", 400);
        }

        const today = new Date().toISOString().slice(0, 10);
        const expiryDateStr = new Date(memberVoucher.expiry_date).toISOString().slice(0, 10);
        if (expiryDateStr < today) {
          throw createError("Voucher đã hết hạn sử dụng", 400);
        }

        appliedMemberVoucherId = memberVoucher.id;
        const subTotal = Number(invoice.sub_total);

        if (memberVoucher.discount_type === "FIXED") {
          voucherDiscount = Math.min(Number(memberVoucher.discount_value), subTotal);
        } else if (memberVoucher.discount_type === "PERCENT") {
          let pctDiscount = (subTotal * Number(memberVoucher.discount_value)) / 100;
          if (memberVoucher.max_discount) {
            pctDiscount = Math.min(pctDiscount, Number(memberVoucher.max_discount));
          }
          voucherDiscount = Math.min(pctDiscount, subTotal);
        }

        const discountAmount = Number(invoice.discount_amount || 0);
        const taxAmount = Number(invoice.tax_amount || 0);
        const serviceCharge = Number(invoice.service_charge || 0);

        finalAmount = Math.max(
          0,
          subTotal - discountAmount - voucherDiscount + taxAmount + serviceCharge
        );

        // Recalculate points earned
        const pointConfigs = await invoiceRepo.getActivePointConfig();
        if (pointConfigs.length > 0) {
          const config = pointConfigs[0];
          pointsEarned =
            Math.floor(finalAmount / Number(config.spend_amount)) *
            Number(config.earn_points);
        }
      }

      // Get member available vouchers
      const vouchers = await voucherRepository.getMemberVouchers(memberId, "AVAILABLE");
      const formattedVouchers = vouchers.map((v) => ({
        ...v,
        discount_value: parseFloat(v.discount_value),
        max_discount: v.max_discount ? parseFloat(v.max_discount) : null,
      }));

      // Get active payment methods
      const paymentMethods = await paymentMethodRepo.getAllActive();

      console.log({
        action: "SELF_PAYMENT",
        invoice: {
          ...invoice,
          voucher_discount: voucherDiscount,
          final_amount: finalAmount,
          points_earned: pointsEarned,
          applied_member_voucher_id: appliedMemberVoucherId,
          voucher_code: voucherCode || null,
          items: items || [],
        },
        vouchers: formattedVouchers,
        payment_methods: paymentMethods,
      })

      return {
        action: "SELF_PAYMENT",
        invoice: {
          ...invoice,
          voucher_discount: voucherDiscount,
          final_amount: finalAmount,
          points_earned: pointsEarned,
          applied_member_voucher_id: appliedMemberVoucherId,
          voucher_code: voucherCode || null,
          items: items || [],
        },
        vouchers: formattedVouchers,
        payment_methods: paymentMethods,
      };
    }

    throw createError("Trạng thái hóa đơn không hợp lệ để xử lý", 400);
  }

  async checkoutPayment(token, memberId, voucherCode, paymentMethodId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Fetch and lock invoice by claim_qr_token
      const queryInvoice = `
        SELECT * FROM invoices 
        WHERE claim_qr_token = $1
        FOR UPDATE;
      `;
      const { rows: invoiceRows } = await client.query(queryInvoice, [token]);
      const invoice = invoiceRows[0];

      if (!invoice) {
        throw createError("Không tìm thấy hóa đơn hợp lệ với mã QR này", 404);
      }

      if (
        invoice.claim_qr_expired_at &&
        new Date(invoice.claim_qr_expired_at) < new Date()
      ) {
        throw createError("Mã QR đã hết hạn sử dụng", 400);
      }

      if (invoice.status === "CANCELLED") {
        throw createError("Hóa đơn này đã bị hủy", 400);
      }

      // -------------------------------------------------------------
      // CASE 1: HÓA ĐƠN ĐÃ THANH TOÁN -> TIẾN HÀNH TÍCH ĐIỂM
      // -------------------------------------------------------------
      if (invoice.status === "COMPLETED") {
        if (invoice.member_id !== null) {
          throw createError("Hóa đơn này đã được tích điểm trước đó", 400);
        }

        // Lấy cấu hình điểm
        const queryConfig = `
          SELECT spend_amount, earn_points 
          FROM point_configs 
          WHERE is_active = true 
          ORDER BY spend_amount ASC 
          LIMIT 1;
        `;
        const { rows: configRows } = await client.query(queryConfig);
        const config = configRows[0];

        if (!config) {
          throw createError("Hệ thống chưa cấu hình quy đổi điểm thưởng", 400);
        }

        // Khóa dòng thông tin thành viên và lấy hệ số nhân điểm của hạng hiện tại
        const queryMember = `
          SELECT m.id, m.tier_id, m.current_points, m.total_accumulated_points, t.point_multiplier
          FROM members m
          LEFT JOIN membership_tiers t ON m.tier_id = t.id
          WHERE m.id = $1
          FOR UPDATE OF m;
        `;
        const { rows: memberRows } = await client.query(queryMember, [memberId]);
        const member = memberRows[0];

        if (!member) {
          throw createError("Không tìm thấy thông tin thành viên", 404);
        }

        // Tính toán điểm thực tế
        const finalAmount = Number(invoice.final_amount);
        const spendAmount = Number(config.spend_amount);
        const earnPoints = Number(config.earn_points);
        const pointMultiplier = Number(member.point_multiplier || 1.0);

        const basePoints = Math.floor(finalAmount / spendAmount) * earnPoints;
        const pointsToEarn = Math.floor(basePoints * pointMultiplier);

        if (pointsToEarn <= 0) {
          throw createError("Hóa đơn không đạt giá trị tối thiểu để nhận điểm thưởng", 400);
        }

        const oldAccumulatedPoints = Number(member.total_accumulated_points);
        const newAccumulatedPoints = oldAccumulatedPoints + pointsToEarn;

        // Cập nhật hóa đơn
        const updateInvoiceQuery = `
          UPDATE invoices 
          SET member_id = $1, points_earned = $2, points_multiplier = $3, points_claimed_at = NOW(), updated_at = NOW() 
          WHERE id = $4;
        `;
        await client.query(updateInvoiceQuery, [memberId, pointsToEarn, pointMultiplier, invoice.id]);

        // Ghi nhận transaction tích điểm
        const insertTxQuery = `
          INSERT INTO point_transactions (
            member_id, transaction_type, points, multiplier_applied, 
            reference_type, reference_id, description, created_at
          ) 
          VALUES ($1, 'EARN', $2, $3, 'INVOICE', $4, $5, NOW());
        `;
        await client.query(insertTxQuery, [
          memberId,
          pointsToEarn,
          pointMultiplier,
          invoice.id,
          `Tích điểm từ hóa đơn ${invoice.invoice_code} qua mã QR gộp`,
        ]);

        // Cập nhật điểm cho thành viên
        const updateMemberQuery = `
          UPDATE members 
          SET 
            current_points = current_points + $1, 
            total_accumulated_points = total_accumulated_points + $1,
            last_activity_date = CURRENT_DATE,
            updated_at = NOW() 
          WHERE id = $2 
          RETURNING current_points, total_accumulated_points, tier_id;
        `;
        const { rows: updatedMemberRows } = await client.query(updateMemberQuery, [pointsToEarn, memberId]);
        const updatedMember = updatedMemberRows[0];

        // Xử lý thăng hạng nếu có
        const queryHighestTier = `
          SELECT id, tier_name, min_points 
          FROM membership_tiers 
          WHERE min_points <= $1 
          ORDER BY min_points DESC 
          LIMIT 1;
        `;
        const { rows: tierRows } = await client.query(queryHighestTier, [newAccumulatedPoints]);
        const highestTier = tierRows[0];

        let isUpgraded = false;
        let newTierName = null;

        if (highestTier && Number(highestTier.id) !== Number(member.tier_id)) {
          const updateTierQuery = `
            UPDATE members 
            SET tier_id = $1, updated_at = NOW() 
            WHERE id = $2;
          `;
          await client.query(updateTierQuery, [highestTier.id, memberId]);

          const insertTierHistoryQuery = `
            INSERT INTO tier_history (
              member_id, old_tier_id, new_tier_id, reason, 
              old_accumulated_points, new_accumulated_points, created_at
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW());
          `;
          await client.query(insertTierHistoryQuery, [
            memberId,
            member.tier_id,
            highestTier.id,
            `Thăng hạng do tích điểm từ hóa đơn ${invoice.invoice_code} quét QR`,
            oldAccumulatedPoints,
            newAccumulatedPoints,
          ]);

          isUpgraded = true;
          newTierName = highestTier.tier_name;

          // Tạo thông báo thăng hạng
          await notificationRepository.createNotification({
            member_id: memberId,
            title: "Thăng hạng thành viên!",
            body: `Chúc mừng bạn đã thăng hạng lên thành viên ${newTierName}! Nhận ngay ưu đãi hạng mới.`,
            type: "TIER_UPGRADE",
            reference_id: highestTier.id,
            reference_type: "MEMBERSHIP_TIER"
          }, client);
        }

        // Thông báo tích điểm thành công
        await notificationRepository.createNotification({
          member_id: memberId,
          title: "Tích lũy điểm thành công",
          body: `Bạn vừa tích thành công +${pointsToEarn} điểm từ hóa đơn ${invoice.invoice_code}.`,
          type: "POINTS_EARNED",
          reference_id: invoice.id,
          reference_type: "INVOICE"
        }, client);

        await client.query("COMMIT");

        console.log({
          action: "CLAIM_POINTS",
          message: "Tích điểm thành công",
          data: {
            invoice_id: invoice.id,
            invoice_code: invoice.invoice_code,
            points_earned: pointsToEarn,
            current_points: updatedMember.current_points,
            total_accumulated_points: updatedMember.total_accumulated_points,
            is_upgraded: isUpgraded,
            new_tier_name: newTierName,
          }
        }) 

        return {
          action: "CLAIM_POINTS",
          message: "Tích điểm thành công",
          data: {
            invoice_id: invoice.id,
            invoice_code: invoice.invoice_code,
            points_earned: pointsToEarn,
            current_points: updatedMember.current_points,
            total_accumulated_points: updatedMember.total_accumulated_points,
            is_upgraded: isUpgraded,
            new_tier_name: newTierName,
          }
        };
      }

      // -------------------------------------------------------------
      // CASE 2: HÓA ĐƠN CHƯA THANH TOÁN -> TIẾN HÀNH THANH TOÁN
      // -------------------------------------------------------------
      if (invoice.status === "DRAFT" || invoice.status === "PENDING") {
        if (!paymentMethodId) {
          throw createError("Vui lòng chọn phương thức thanh toán", 400);
        }

        // Fetch and lock member
        const queryMember = `
          SELECT m.id, m.tier_id, m.current_points, m.total_accumulated_points, t.point_multiplier
          FROM members m
          LEFT JOIN membership_tiers t ON m.tier_id = t.id
          WHERE m.id = $1
          FOR UPDATE OF m;
        `;
        const { rows: memberRows } = await client.query(queryMember, [memberId]);
        const member = memberRows[0];

        if (!member) {
          throw createError("Không tìm thấy thông tin thành viên", 404);
        }

        // Calculate discount & apply voucher if provided
        let appliedMemberVoucherId = null;
        let voucherDiscount = 0;
        const subTotal = Number(invoice.sub_total);

        if (voucherCode) {
          const queryVoucher = `
            SELECT mv.*, v.discount_type, v.discount_value, v.max_discount
            FROM member_vouchers mv
            LEFT JOIN vouchers v ON mv.voucher_id = v.id
            WHERE mv.voucher_code = $1 AND mv.member_id = $2
            FOR UPDATE OF mv;
          `;
          const { rows: voucherRows } = await client.query(queryVoucher, [voucherCode, memberId]);
          const memberVoucher = voucherRows[0];

          if (!memberVoucher) {
            throw createError("Voucher không hợp lệ hoặc không thuộc về thành viên này", 400);
          }

          if (memberVoucher.status !== "AVAILABLE") {
            throw createError("Voucher này đã được sử dụng hoặc đã hết hạn", 400);
          }

          const today = new Date().toISOString().slice(0, 10);
          const expiryDateStr = new Date(memberVoucher.expiry_date).toISOString().slice(0, 10);
          if (expiryDateStr < today) {
            throw createError("Voucher đã hết hạn sử dụng", 400);
          }

          appliedMemberVoucherId = memberVoucher.id;

          if (memberVoucher.discount_type === "FIXED") {
            voucherDiscount = Math.min(Number(memberVoucher.discount_value), subTotal);
          } else if (memberVoucher.discount_type === "PERCENT") {
            let pctDiscount = (subTotal * Number(memberVoucher.discount_value)) / 100;
            if (memberVoucher.max_discount) {
              pctDiscount = Math.min(pctDiscount, Number(memberVoucher.max_discount));
            }
            voucherDiscount = Math.min(pctDiscount, subTotal);
          }
        }

        const discountAmount = Number(invoice.discount_amount || 0);
        const taxAmount = Number(invoice.tax_amount || 0);
        const serviceCharge = Number(invoice.service_charge || 0);

        const finalAmount = Math.max(
          0,
          subTotal - discountAmount - voucherDiscount + taxAmount + serviceCharge
        );

        // Calculate points earned
        const pointConfigs = await invoiceRepo.getActivePointConfig(client);
        let pointsEarned = 0;

        if (pointConfigs.length > 0) {
          const config = pointConfigs[0];
          pointsEarned =
            Math.floor(finalAmount / Number(config.spend_amount)) *
            Number(config.earn_points);
        }

        const pointMultiplier = Number(member.point_multiplier || 1.0);

        // Update invoice member details, voucher, and values
        const updateInvoiceQuery = `
          UPDATE invoices
          SET 
            member_id = $1,
            points_multiplier = $2,
            points_earned = $3,
            applied_member_voucher_id = $4,
            voucher_discount = $5,
            final_amount = $6,
            updated_at = NOW()
          WHERE id = $7
          RETURNING *;
        `;
        const { rows: updatedInvoiceRows } = await client.query(updateInvoiceQuery, [
          memberId,
          pointMultiplier,
          pointsEarned,
          appliedMemberVoucherId,
          voucherDiscount,
          finalAmount,
          invoice.id,
        ]);
        let updatedInvoice = updatedInvoiceRows[0];

        // Fetch selected payment method
        const paymentMethod = await paymentMethodRepo.findById(paymentMethodId, client);
        if (!paymentMethod || !paymentMethod.is_active) {
          throw createError("Phương thức thanh toán không hợp lệ hoặc đã bị khóa", 400);
        }

        // Perform checkout depending on payment method
        if (paymentMethod.code === "cash") {
          const updateStatusQuery = `
            UPDATE invoices
            SET 
              status = 'PENDING',
              payment_method_id = $1,
              payment_method = $2,
              updated_at = NOW()
            WHERE id = $3
            RETURNING *;
          `;
          const { rows: statusRows } = await client.query(updateStatusQuery, [
            paymentMethodId,
            paymentMethod.code,
            invoice.id
          ]);
          updatedInvoice = statusRows[0];

          await client.query("COMMIT");

          try {
            const { getIO } = require("../../socket");
            const io = getIO();
            io.to(`invoice_${invoice.id}`).emit("CASH_PAYMENT_PENDING", {
              invoice_code: invoice.invoice_code,
              table_number: invoice.table_number,
              final_amount: finalAmount,
              invoice_id: invoice.id,
              status: "PENDING",
            });
          } catch (socketError) {
            console.error("Socket error (non-fatal):", socketError);
          }

          return {
            action: "SELF_PAYMENT",
            type: "cash",
            status: "PENDING",
            message: "Đang chờ nhân viên xác nhận thanh toán tiền mặt",
            invoice: updatedInvoice,
          };
        }

        if (paymentMethod.code === "payos") {
          await invoiceRepo.updatePaymentMethod(
            invoice.id,
            paymentMethod.code,
            paymentMethodId,
            client
          );
          await client.query("COMMIT");

          const paymentLink = await payOsService.createPaymentLink(updatedInvoice);

          return {
            action: "SELF_PAYMENT",
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
            invoice.id,
            paymentMethod.code,
            paymentMethodId,
            client
          );
          await client.query("COMMIT");

          const paymentLink = await miOService.createPaymentLink(
            updatedInvoice,
            paymentMethod
          );

          return {
            action: "SELF_PAYMENT",
            type: "mio",
            message: "Tạo link thanh toán MiO thành công",
            checkout_url: paymentLink.checkoutUrl,
            qr_code: paymentLink.qrCode,
            order_code: paymentLink.orderCode,
            invoice_id: invoice.id,
          };
        }

        throw createError("Phương thức thanh toán chưa được hỗ trợ", 400);
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new SelfPaymentService();
