const pool = require("../../config/database");

class PaymentMethodRepository {
  async getAllActive(client = null) {
    const db = client || pool;

    const query = `
      SELECT 
        id,
        name,
        code,
        description,
        is_active,
        created_at
      FROM payment_methods
      WHERE is_active = true
      ORDER BY id ASC
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  async getAll(client = null) {
    const db = client || pool;

    const query = `
      SELECT * FROM payment_methods
      ORDER BY id ASC
    `;

    const { rows } = await db.query(query);
    return rows;
  }

  /**
   * Lấy 1 phương thức thanh toán theo ID
   */
  async findById(id, client = null) {
    const db = client || pool;

    const query = `SELECT * FROM payment_methods WHERE id = $1`;
    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async findByCode(code, client = null) {
    const db = client || pool;

    const query = `SELECT * FROM payment_methods WHERE code = $1`;
    const { rows } = await db.query(query, [code]);
    return rows[0] || null;
  }
}

module.exports = new PaymentMethodRepository();
