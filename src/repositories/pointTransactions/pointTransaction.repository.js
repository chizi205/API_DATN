const pool = require("../../config/database");

class PointTransactionRepository {
  async createTransaction(data, client = null) {
    const db = client || pool;

    const query = `
      INSERT INTO point_transactions (
        member_id,
        transaction_type,
        points,
        multiplier_applied,
        reference_type,
        reference_id,
        description,
        created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      data.member_id,
      data.transaction_type,
      data.points,
      data.multiplier_applied || 1.0,
      data.reference_type || null,
      data.reference_id || null,
      data.description || null,
      data.created_by || null,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async getTransactionsByMemberId(
    memberId,
    { page = 1, limit = 20 } = {},
    client = null,
  ) {
    const db = client || pool;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        pt.*,
        m.full_name AS member_name
      FROM point_transactions pt
      LEFT JOIN members m ON pt.member_id = m.id
      WHERE pt.member_id = $1
      ORDER BY pt.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*)::int as total 
      FROM point_transactions 
      WHERE member_id = $1
    `;

    const [transactions, countResult] = await Promise.all([
      db.query(query, [memberId, limit, offset]),
      db.query(countQuery, [memberId]),
    ]);

    return {
      data: transactions.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết một giao dịch điểm
   */
  async findById(id, client = null) {
    const db = client || pool;

    const query = `
      SELECT pt.*, m.full_name AS member_name
      FROM point_transactions pt
      LEFT JOIN members m ON pt.member_id = m.id
      WHERE pt.id = $1
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  /**
   * Lấy giao dịch theo reference (ví dụ: theo invoice_id)
   */
  async findByReference(referenceType, referenceId, client = null) {
    const db = client || pool;

    const query = `
      SELECT * FROM point_transactions 
      WHERE reference_type = $1 AND reference_id = $2
      ORDER BY created_at DESC
    `;

    const { rows } = await db.query(query, [referenceType, referenceId]);
    return rows;
  }
}

module.exports = new PointTransactionRepository();
