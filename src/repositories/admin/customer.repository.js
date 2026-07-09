const pool = require("../../config/database");

class CustomerRepository {
  generateBarcode(memberId) {
    const paddedId = String(memberId).padStart(8, "0");
    return `BC${paddedId}`;
  }

  async findAll({ search, tierId, isActive, limit = 10, offset = 0 }) {
    let query = `
      SELECT m.*, t.tier_name, t.color_code
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE 1=1
    `;
    const params = [];
    let index = 1;

    if (search) {
      query += ` AND (m.full_name ILIKE $${index} OR m.phone_number ILIKE $${index} OR m.email ILIKE $${index})`;
      params.push(`%${search}%`);
      index++;
    }

    if (tierId) {
      query += ` AND m.tier_id = $${index}`;
      params.push(tierId);
      index++;
    }

    if (isActive !== undefined && isActive !== null) {
      query += ` AND m.is_active = $${index}`;
      params.push(isActive === "true" || isActive === true);
      index++;
    }

    query += ` ORDER BY m.id DESC LIMIT $${index} OFFSET $${index + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async countAll({ search, tierId, isActive }) {
    let query = `
      SELECT COUNT(*) as total
      FROM members m
      WHERE 1=1
    `;
    const params = [];
    let index = 1;

    if (search) {
      query += ` AND (m.full_name ILIKE $${index} OR m.phone_number ILIKE $${index} OR m.email ILIKE $${index})`;
      params.push(`%${search}%`);
      index++;
    }

    if (tierId) {
      query += ` AND m.tier_id = $${index}`;
      params.push(tierId);
      index++;
    }

    if (isActive !== undefined && isActive !== null) {
      query += ` AND m.is_active = $${index}`;
      params.push(isActive === "true" || isActive === true);
      index++;
    }

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].total, 10);
  }

  async findById(id) {
    const query = `
      SELECT m.*, t.tier_name, t.color_code, t.min_points
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE m.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByPhone(phone) {
    const query = `SELECT * FROM members WHERE phone_number = $1`;
    const { rows } = await pool.query(query, [phone]);
    return rows[0] || null;
  }

  async getCustomerInvoiceHistory(memberId) {
    const query = `
      SELECT i.id, i.invoice_code, i.sub_total, i.discount_amount, i.voucher_discount, 
             i.final_amount, i.status, i.paid_at, i.created_at, i.payment_method,
             b.name AS branch_name
      FROM invoices i
      LEFT JOIN branches b ON i.branch_id = b.id
      WHERE i.member_id = $1
      ORDER BY i.created_at DESC
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows;
  }

  async create(data) {
    const insertQuery = `
      INSERT INTO members (
        phone_number, full_name, email, gender, date_of_birth, 
        tier_id, current_points, total_accumulated_points, is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      data.phone_number,
      data.full_name || null,
      data.email || null,
      data.gender || "UNKNOWN",
      data.date_of_birth || null,
      data.tier_id || null,
      data.current_points || 0,
      data.total_accumulated_points || 0,
      data.is_active !== undefined ? data.is_active : true,
    ];

    const { rows } = await pool.query(insertQuery, values);
    const newMember = rows[0];

    const barcode = this.generateBarcode(newMember.id);
    const updateResult = await pool.query(
      `UPDATE members SET barcode = $1 WHERE id = $2 RETURNING *`,
      [barcode, newMember.id]
    );

    return updateResult.rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    const updatableFields = [
      "phone_number",
      "full_name",
      "email",
      "gender",
      "date_of_birth",
      "tier_id",
      "current_points",
      "total_accumulated_points",
      "is_active",
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${index}`);
        values.push(data[field]);
        index++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE members 
      SET ${fields.join(", ")} 
      WHERE id = $${index} 
      RETURNING *
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async delete(id) {
    const query = `
      UPDATE members 
      SET is_active = false, updated_at = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new CustomerRepository();
