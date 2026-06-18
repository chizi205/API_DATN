const pool = require("../../config/database");

class InfoRepository {
  async getMemberCard(memberId) {
    const query = `
      SELECT 
        m.id,
        m.full_name,
        m.phone_number,
        m.current_points,
        m.barcode,
        
        t.id AS tier_id,
        t.tier_name,
        t.color_code,
        t.min_points AS tier_min_points,
        
        (
          SELECT min_points 
          FROM membership_tiers 
          WHERE min_points > t.min_points 
          ORDER BY min_points ASC 
          LIMIT 1
        ) AS next_tier_min_points,
        
        (
          SELECT tier_name 
          FROM membership_tiers 
          WHERE min_points > t.min_points 
          ORDER BY min_points ASC 
          LIMIT 1
        ) AS next_tier_name

      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE m.id = $1
    `;

    const result = await pool.query(query, [memberId]);
    const row = result.rows[0];

    if (!row) return null;

    const currentPoints = row.current_points || 0;
    const targetPoints =
      row.next_tier_min_points || row.tier_min_points || 1000;
    const percentage =
      targetPoints > 0
        ? Math.min(Math.floor((currentPoints / targetPoints) * 100), 100)
        : 0;

    return {
      id: row.id,
      full_name: row.full_name,
      phone_number: row.phone_number,
      current_points: currentPoints,
      barcode: row.barcode || `MEMBER-${String(row.id).padStart(9, "0")}`,

      tier: {
        id: row.tier_id,
        name: row.tier_name,
        color_code: row.color_code,
        min_points: row.tier_min_points,
      },

      progress: {
        current: currentPoints,
        target: targetPoints,
        percentage: percentage,
        next_tier_name: row.next_tier_name || null,
      },
    };
  }
  async getMemberProfile(memberId) {
    const query = `
      SELECT
        m.id,
        m.full_name,
        m.phone_number,
        m.email,
        m.date_of_birth,
        m.current_points,
        m.gender,
        m.total_accumulated_points,
        m.barcode,
        m.created_at AS join_date,
        t.id AS tier_id,
        t.tier_name,
        t.color_code,
        t.min_points AS tier_min_points,
        t.benefits,
        (
          SELECT min_points
          FROM membership_tiers
          WHERE min_points > t.min_points
          ORDER BY min_points ASC
          LIMIT 1
        ) AS next_tier_min_points,
        (
          SELECT tier_name
          FROM membership_tiers
          WHERE min_points > t.min_points
          ORDER BY min_points ASC
          LIMIT 1
        ) AS next_tier_name
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE m.id = $1
    `;

    const result = await pool.query(query, [memberId]);
    const row = result.rows[0];
    if (!row) return null;

    const currentPoints = row.current_points || 0;
    const targetPoints =
      row.next_tier_min_points || row.tier_min_points || 1000;
    const percentage =
      targetPoints > 0
        ? Math.min(Math.floor((currentPoints / targetPoints) * 100), 100)
        : 0;

    return {
      id: row.id,
      full_name: row.full_name,
      phone_number: row.phone_number,
      email: row.email || null,
      gender: row.gender || "UNKNOWN",
      total_accumulated_points: row.total_accumulated_points,
      date_of_birth: row.date_of_birth || null,
      barcode: row.barcode || `MEMBER-${String(row.id).padStart(9, "0")}`,
      join_date: row.join_date,

      tier: {
        id: row.tier_id,
        name: row.tier_name,
        color_code: row.color_code,
        min_points: row.tier_min_points,
        benefits: row.benefits || null,
      },

      progress: {
        current: currentPoints,
        target: targetPoints,
        percentage: percentage,
        next_tier_name: row.next_tier_name || null,
      },

      stats: {
        total_points_earned: currentPoints,
        total_orders: 0,
        total_spent: 0,
        vouchers_redeemed: 0,
      },
    };
  }
  async getMemberPointsMultiplier(memberId, client = null) {
    const db = client || pool;

    const query = `
      SELECT 
        m.id AS member_id,
        m.tier_id,
        t.tier_name AS tier_name,
        t.point_multiplier
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE m.id = $1
    `;

    const { rows } = await db.query(query, [memberId]);
    return rows[0] || null;
  }
  async searchByPhone(phoneNumber, client = null) {
    const db = client || pool;

    const query = `
    SELECT 
      m.id,
      m.full_name,
      m.current_points,
      t.tier_name AS tier_name,
      t.point_multiplier
    FROM members m
    LEFT JOIN membership_tiers t ON m.tier_id = t.id
    WHERE m.phone_number = $1
  `;

    const { rows } = await db.query(query, [phoneNumber]);
    return rows[0] || null;
  }
  async addPoints(memberId, pointsToAdd, client = null) {
    const db = client || pool;

    if (!memberId || !pointsToAdd || pointsToAdd <= 0) {
      return null;
    }

    const query = `
    UPDATE members 
    SET 
      current_points = current_points + $1,
      total_accumulated_points = total_accumulated_points + $1,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = $2
    RETURNING 
      id, 
      phone_number, 
      full_name, 
      current_points, 
      total_accumulated_points;
  `;

    const { rows } = await db.query(query, [pointsToAdd, memberId]);
    return rows[0];
  }
}

module.exports = new InfoRepository();
