const pool = require("../../config/database");

class InvoiceRepository {
  async findAll({
    search,
    branchId,
    employeeId,
    memberId,
    status,
    start_date,
    end_date,
    limit = 10,
    offset = 0,
  }) {
    let query = `
      SELECT i.*, 
             b.name AS branch_name, 
             e.full_name AS employee_name, 
             m.full_name AS member_name
      FROM invoices i
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN members m ON i.member_id = m.id
      WHERE 1=1
    `;
    const params = [];
    let index = 1;

    if (search) {
      query += ` AND i.invoice_code ILIKE $${index}`;
      params.push(`%${search}%`);
      index++;
    }

    if (branchId) {
      query += ` AND i.branch_id = $${index}`;
      params.push(branchId);
      index++;
    }

    if (employeeId) {
      query += ` AND i.employee_id = $${index}`;
      params.push(employeeId);
      index++;
    }

    if (memberId) {
      query += ` AND i.member_id = $${index}`;
      params.push(memberId);
      index++;
    }

    if (status) {
      query += ` AND i.status = $${index}`;
      params.push(status);
      index++;
    }

    if (start_date) {
      query += ` AND TO_CHAR(i.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') >= $${index}`;
      params.push(start_date);
      index++;
    }

    if (end_date) {
      query += ` AND TO_CHAR(i.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') <= $${index}`;
      params.push(end_date);
      index++;
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
    params.push(limit, offset);
    console.log(query)

    const { rows } = await pool.query(query, params);
    return rows;
  }

  async countAll({
    search,
    branchId,
    employeeId,
    memberId,
    status,
    start_date,
    end_date,
  }) {
    let query = `
      SELECT COUNT(*) as total
      FROM invoices i
      WHERE 1=1
    `;
    const params = [];
    let index = 1;

    if (search) {
      query += ` AND i.invoice_code ILIKE $${index}`;
      params.push(`%${search}%`);
      index++;
    }

    if (branchId) {
      query += ` AND i.branch_id = $${index}`;
      params.push(branchId);
      index++;
    }

    if (employeeId) {
      query += ` AND i.employee_id = $${index}`;
      params.push(employeeId);
      index++;
    }

    if (memberId) {
      query += ` AND i.member_id = $${index}`;
      params.push(memberId);
      index++;
    }

    if (status) {
      query += ` AND i.status = $${index}`;
      params.push(status);
      index++;
    }

    if (start_date) {
      query += ` AND TO_CHAR(i.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') >= $${index}`;
      params.push(start_date);
      index++;
    }

    if (end_date) {
      query += ` AND TO_CHAR(i.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') <= $${index}`;
      params.push(end_date);
      index++;
    }

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].total, 10);
  }

  async findById(id) {
    const query = `
      SELECT i.*, 
             b.name AS branch_name, 
             e.full_name AS employee_name, 
             m.full_name AS member_name,
             m.phone_number AS member_phone
      FROM invoices i
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN members m ON i.member_id = m.id
      WHERE i.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async getInvoiceDetails(invoiceId) {
    const query = `
      SELECT id, invoice_id, product_id, product_name, quantity, unit_price
      FROM invoice_details
      WHERE invoice_id = $1
      ORDER BY id ASC
    `;
    const { rows } = await pool.query(query, [invoiceId]);
    return rows;
  }

  async updateStatus(id, status) {
    const query = `
      UPDATE invoices
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0] || null;
  }
}

module.exports = new InvoiceRepository();
