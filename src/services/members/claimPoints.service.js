const pool = require("../../config/database");
const notificationRepository = require("../../repositories/members/notification.repository");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class ClaimPointsService {
  async previewPoints(token, memberId) {
    const queryInvoice = `
      SELECT id, final_amount, status, member_id, claim_qr_expired_at , invoice_code
      FROM invoices 
      WHERE claim_qr_token = $1;
    `;

    const { rows: invoiceRows } = await pool.query(queryInvoice, [token]);
    const invoice = invoiceRows[0];

    if (!invoice) {
      throw createError("Không tìm thấy hóa đơn hợp lệ với mã QR này", 404);
    }

    if (invoice.status !== "COMPLETED") {
      throw createError("Hóa đơn chưa hoàn thành thanh toán", 400);
    }

    if (invoice.member_id !== null) {
      throw createError("Hóa đơn này đã được tích điểm trước đó", 400);
    }

    if (
      invoice.claim_qr_expired_at &&
      new Date(invoice.claim_qr_expired_at) < new Date()
    ) {
      throw createError("Mã QR tích điểm đã hết hạn", 400);
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
      invoice_id: invoice.id,
      invoice_code: invoice.invoice_code,
      final_amount: finalAmount,
      expected_points: expectedPoints,
      point_multiplier: pointMultiplier,
    };
  }

  async claimPoints(token, memberId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const queryInvoice = `
        SELECT id, final_amount, status, member_id, claim_qr_expired_at, invoice_code 
        FROM invoices 
        WHERE claim_qr_token = $1 
        FOR UPDATE;
      `;
      const { rows: invoiceRows } = await client.query(queryInvoice, [token]);
      const invoice = invoiceRows[0];

      if (!invoice) {
        throw createError("Không tìm thấy hóa đơn hợp lệ với mã QR này", 404);
      }

      // 2. Thẩm định điều kiện
      if (invoice.status !== "COMPLETED") {
        throw createError("Hóa đơn chưa hoàn thành thanh toán", 400);
      }

      if (invoice.member_id !== null) {
        throw createError("Hóa đơn này đã được tích điểm trước đó", 400);
      }

      if (
        invoice.claim_qr_expired_at &&
        new Date(invoice.claim_qr_expired_at) < new Date()
      ) {
        throw createError("Mã QR tích điểm đã hết hạn", 400);
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

      // 3. Tính toán điểm thực tế
      const finalAmount = Number(invoice.final_amount);
      const spendAmount = Number(config.spend_amount);
      const earnPoints = Number(config.earn_points);
      const pointMultiplier = Number(member.point_multiplier || 1.0);

      const basePoints = Math.floor(finalAmount / spendAmount) * earnPoints;
      const pointsToEarn = Math.floor(basePoints * pointMultiplier);

      if (pointsToEarn <= 0) {
        throw createError(
          "Hóa đơn không đạt giá trị tối thiểu để nhận điểm thưởng",
          400,
        );
      }

      const oldAccumulatedPoints = Number(member.total_accumulated_points);
      const newAccumulatedPoints = oldAccumulatedPoints + pointsToEarn;

      // 4. Cập nhật dữ liệu
      // UPDATE invoices
      const updateInvoiceQuery = `
        UPDATE invoices 
        SET member_id = $1, points_claimed_at = NOW(), updated_at = NOW() 
        WHERE id = $2;
      `;
      await client.query(updateInvoiceQuery, [memberId, invoice.id]);

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
        `Tích điểm từ hóa đơn ${invoice.invoice_code} qua mã QR`,
      ]);

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
      const { rows: updatedMemberRows } = await client.query(
        updateMemberQuery,
        [pointsToEarn, memberId],
      );
      const updatedMember = updatedMemberRows[0];

      const queryHighestTier = `
        SELECT id, tier_name, min_points 
        FROM membership_tiers 
        WHERE min_points <= $1 
        ORDER BY min_points DESC 
        LIMIT 1;
      `;
      const { rows: tierRows } = await client.query(queryHighestTier, [
        newAccumulatedPoints,
      ]);
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
          `Thăng hạng do tích điểm từ mã QR hóa đơn ${invoice.invoice_code}`,
          oldAccumulatedPoints,
          newAccumulatedPoints,
        ]);

        isUpgraded = true;
        newTierName = highestTier.tier_name;

        // Insert TIER_UPGRADE notification
        await notificationRepository.createNotification({
          member_id: memberId,
          title: "Thăng hạng thành viên!",
          body: `Chúc mừng bạn đã thăng hạng lên thành viên ${newTierName}! Nhận ngay ưu đãi hạng mới.`,
          type: "TIER_UPGRADE",
          reference_id: highestTier.id,
          reference_type: "MEMBERSHIP_TIER"
        }, client);
      }

      // Insert POINTS_EARNED notification
      await notificationRepository.createNotification({
        member_id: memberId,
        title: "Tích lũy điểm thành công",
        body: `Bạn vừa tích thành công +${pointsToEarn} điểm từ hóa đơn ${invoice.invoice_code}.`,
        type: "POINTS_EARNED",
        reference_id: invoice.id,
        reference_type: "INVOICE"
      }, client);

      await client.query("COMMIT");

      return {
        invoice_id: invoice.id,
        invoice_code: invoice.invoice_code,
        points_earned: pointsToEarn,
        current_points: updatedMember.current_points,
        total_accumulated_points: updatedMember.total_accumulated_points,
        is_upgraded: isUpgraded,
        new_tier_name: newTierName,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new ClaimPointsService();
