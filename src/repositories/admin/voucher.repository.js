const pool = require("../../config/database");

class VoucherRepository {
  async getAllVouchers(limit = 20, offset = 0) {
    const query = `
      SELECT * FROM vouchers
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT * FROM vouchers WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByCode(code) {
    const query = `
      SELECT * FROM vouchers WHERE code = $1 LIMIT 1;
    `;
    const { rows } = await pool.query(query, [code]);
    return rows[0] || null;
  }

  async createVoucher(data) {
    const query = `
      INSERT INTO vouchers (
        code, title, discount_type, discount_value, max_discount,
        point_cost, stock_quantity, applicable_tiers, valid_from,
        valid_to, expiry_days, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      data.code,
      data.title,
      data.discount_type,
      data.discount_value,
      data.max_discount || null,
      data.point_cost || 0,
      data.stock_quantity || 0,
      data.applicable_tiers || null,
      data.valid_from || null,
      data.valid_to || null,
      data.expiry_days || null,
      data.is_active !== undefined ? data.is_active : true,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateVoucher(id, data) {
    let setClauses = [];
    let values = [];
    let index = 1;

    const fields = [
      "code", "benefits", "discount_type", "discount_value", "max_discount",
      "point_cost", "stock_quantity", "applicable_tiers", "valid_from",
      "valid_to", "expiry_days", "is_active"
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index++}`);
        values.push(data[field]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);

    const query = `
      UPDATE vouchers
      SET ${setClauses.join(", ")}
      WHERE id = $${index++}
      RETURNING *;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async deleteVoucher(id) {
    const query = `
      UPDATE vouchers
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = new VoucherRepository();
