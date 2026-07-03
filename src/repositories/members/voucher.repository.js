const pool = require("../../config/database");
const notificationRepository = require("./notification.repository");

class VoucherRepository {
  async getMemberWithTier(memberId) {
    const query = `
      SELECT 
        m.id, 
        m.current_points, 
        m.total_accumulated_points, 
        m.tier_id,
        t.tier_name, 
        t.min_points AS tier_min_points,
        t.color_code AS tier_color_code
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE m.id = $1
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows[0] || null;
  }

  async getAllActiveVouchers() {
    const query = `
      SELECT 
        id, 
        code, 
        title, 
        discount_type, 
        discount_value, 
        max_discount, 
        point_cost, 
        stock_quantity, 
        applicable_tiers, 
        valid_from, 
        valid_to, 
        expiry_days, 
        is_active
      FROM vouchers
      WHERE is_active = true
        AND stock_quantity > 0
        AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
        AND (valid_to IS NULL OR valid_to >= CURRENT_DATE)
      ORDER BY point_cost ASC, id ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getAllMembershipTiers() {
    const query = `
      SELECT id, tier_name, min_points, color_code
      FROM membership_tiers
      ORDER BY min_points ASC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async getVoucherById(id) {
    const query = `
      SELECT * FROM vouchers WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async redeemVoucherTransaction(memberId, voucherId, pointCost, expiryDate, voucherCode) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Deduct points from member
      const updateMemberQuery = `
        UPDATE members 
        SET 
          current_points = current_points - $1,
          updated_at = NOW()
        WHERE id = $2 
        RETURNING current_points;
      `;
      const memberRes = await client.query(updateMemberQuery, [pointCost, memberId]);
      const newPoints = memberRes.rows[0].current_points;

      // 2. Decrement voucher stock quantity
      const updateVoucherQuery = `
        UPDATE vouchers 
        SET 
          stock_quantity = stock_quantity - 1,
          updated_at = NOW()
        WHERE id = $1;
      `;
      await client.query(updateVoucherQuery, [voucherId]);

      // 3. Create member voucher record
      const insertMemberVoucherQuery = `
        INSERT INTO member_vouchers (
          member_id, 
          voucher_id, 
          voucher_code, 
          status, 
          points_spent, 
          expiry_date,
          acquired_at
        ) 
        VALUES ($1, $2, $3, 'AVAILABLE', $4, $5, NOW())
        RETURNING *;
      `;
      const mvRes = await client.query(insertMemberVoucherQuery, [
        memberId,
        voucherId,
        voucherCode,
        pointCost,
        expiryDate,
      ]);
      const memberVoucher = mvRes.rows[0];

      // 4. Record point transaction log
      const insertTxQuery = `
        INSERT INTO point_transactions (
          member_id, 
          transaction_type, 
          points, 
          multiplier_applied, 
          reference_type, 
          reference_id, 
          description,
          created_at
        ) 
        VALUES ($1, 'REDEEM', $2, 1.0, 'MEMBER_VOUCHER', $3, $4, NOW());
      `;
      await client.query(insertTxQuery, [
        memberId,
        pointCost,
        memberVoucher.id,
        `Đổi voucher: ${voucherCode}`,
      ]);

      // Get voucher info to include title in notifications
      const getVoucherInfoQuery = `SELECT title FROM vouchers WHERE id = $1;`;
      const voucherInfoRes = await client.query(getVoucherInfoQuery, [voucherId]);
      const voucherTitle = voucherInfoRes.rows[0]?.title || "Voucher ưu đãi";

      // 5. Insert POINTS_REDEEMED notification
      await notificationRepository.createNotification({
        member_id: memberId,
        title: "Đổi điểm quà tặng",
        body: `Bạn đã dùng -${pointCost} điểm tích lũy để đổi ưu đãi.`,
        type: "POINTS_REDEEMED",
        reference_id: memberVoucher.id,
        reference_type: "MEMBER_VOUCHER"
      }, client);

      // 6. Insert VOUCHER_RECEIVED notification
      await notificationRepository.createNotification({
        member_id: memberId,
        title: "Nhận ưu đãi mới thành công",
        body: `Chúc mừng bạn đã nhận voucher "${voucherTitle}". Hạn sử dụng đến ngày ${new Date(expiryDate).toLocaleDateString("vi-VN")}.`,
        type: "VOUCHER_RECEIVED",
        reference_id: memberVoucher.id,
        reference_type: "MEMBER_VOUCHER"
      }, client);

      await client.query("COMMIT");

      return {
        memberVoucher,
        newPoints,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getMemberVouchers(memberId, status = null) {
    let query = `
      SELECT 
        mv.id AS member_voucher_id,
        mv.voucher_code,
        CASE 
          WHEN mv.status = 'AVAILABLE' AND mv.expiry_date < CURRENT_DATE THEN 'EXPIRED'
          ELSE mv.status 
        END AS status,
        mv.points_spent,
        mv.acquired_at,
        mv.expiry_date,
        mv.used_at,
        mv.used_invoice_id,
        v.id AS voucher_id,
        v.title,
        v.discount_type,
        v.discount_value,
        v.max_discount
      FROM member_vouchers mv
      LEFT JOIN vouchers v ON mv.voucher_id = v.id
      WHERE mv.member_id = $1
    `;
    
    const params = [memberId];
    if (status) {
      const normalizedStatus = String(status).toUpperCase();
      if (normalizedStatus === 'EXPIRED') {
        query += ` AND (mv.status = 'EXPIRED' OR (mv.status = 'AVAILABLE' AND mv.expiry_date < CURRENT_DATE))`;
      } else if (normalizedStatus === 'AVAILABLE') {
        query += ` AND mv.status = 'AVAILABLE' AND mv.expiry_date >= CURRENT_DATE`;
      } else {
        query += ` AND mv.status = $2`;
        params.push(normalizedStatus);
      }
    }
    
    query += ` ORDER BY mv.acquired_at DESC`;
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async getMemberVoucherByCode(voucherCode, client = null) {
    const db = client || pool;
    const query = `
      SELECT mv.*, v.discount_type, v.discount_value, v.max_discount, v.code AS base_code
      FROM member_vouchers mv
      LEFT JOIN vouchers v ON mv.voucher_id = v.id
      WHERE mv.voucher_code = $1;
    `;
    const { rows } = await db.query(query, [voucherCode]);
    return rows[0] || null;
  }
}

module.exports = new VoucherRepository();
