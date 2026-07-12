const pool = require("../../config/database");

class ReservationRepository {
  async createReservation(data, client = null) {
    const queryExecutor = client || pool;
    const query = `
      INSERT INTO reservations (
        member_id, branch_id, reservation_time, guest_count, status, note, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, 'PENDING', $5, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      data.member_id,
      data.branch_id,
      data.reservation_time,
      data.guest_count,
      data.note || null,
    ];
    const { rows } = await queryExecutor.query(query, values);
    return rows[0];
  }

  async getReservations(filters) {
    const { branch_id, member_id, status, date, limit = 20, offset = 0 } = filters;
    const values = [];
    let paramIdx = 1;
    let whereConditions = [];

    if (branch_id) {
      whereConditions.push(`r.branch_id = $${paramIdx}`);
      values.push(branch_id);
      paramIdx++;
    }

    if (member_id) {
      whereConditions.push(`r.member_id = $${paramIdx}`);
      values.push(member_id);
      paramIdx++;
    }

    if (status) {
      whereConditions.push(`r.status = $${paramIdx}`);
      values.push(status);
      paramIdx++;
    }

    if (date) {
      whereConditions.push(`DATE(r.reservation_time) = $${paramIdx}`);
      values.push(date);
      paramIdx++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    const query = `
      SELECT 
        r.id,
        r.member_id,
        r.branch_id,
        r.reservation_time,
        r.guest_count,
        r.status,
        r.note,
        r.created_at,
        r.updated_at,
        m.full_name AS member_name,
        m.phone_number AS member_phone,
        b.name AS branch_name
      FROM reservations r
      LEFT JOIN members m ON r.member_id = m.id
      LEFT JOIN branches b ON r.branch_id = b.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1};
    `;

    values.push(limit, offset);
    const { rows } = await pool.query(query, values);
    return rows;
  }

  async countReservations(filters) {
    const { branch_id, member_id, status, date } = filters;
    const values = [];
    let paramIdx = 1;
    let whereConditions = [];

    if (branch_id) {
      whereConditions.push(`branch_id = $${paramIdx}`);
      values.push(branch_id);
      paramIdx++;
    }

    if (member_id) {
      whereConditions.push(`member_id = $${paramIdx}`);
      values.push(member_id);
      paramIdx++;
    }

    if (status) {
      whereConditions.push(`status = $${paramIdx}`);
      values.push(status);
      paramIdx++;
    }

    if (date) {
      whereConditions.push(`DATE(reservation_time) = $${paramIdx}`);
      values.push(date);
      paramIdx++;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    const query = `
      SELECT COUNT(*) as total 
      FROM reservations
      ${whereClause};
    `;

    const { rows } = await pool.query(query, values);
    return parseInt(rows[0].total, 10);
  }

  async updateReservationStatus(id, status, cancel_reason = null, client = null) {
    const queryExecutor = client || pool;
    const query = `
      UPDATE reservations
      SET status = $1, cancel_reason = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *;
    `;
    const { rows } = await queryExecutor.query(query, [status, cancel_reason, id]);
    return rows[0];
  }

  async findById(id) {
    const query = `
      SELECT r.*, b.name AS branch_name
      FROM reservations r
      LEFT JOIN branches b ON r.branch_id = b.id
      WHERE r.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new ReservationRepository();
