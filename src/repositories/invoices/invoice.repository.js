const pool = require("../../config/database");

class InvoiceRepository {
  async create(data, client = null) {
    const db = client || pool;

    const insertQuery = `
    INSERT INTO invoices (
      employee_id, branch_id, member_id,
      sub_total, discount_amount, voucher_discount, final_amount,
      points_earned, points_multiplier, status, table_number,
      tax_amount, service_charge
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13
    )
    RETURNING *;
  `;

    const values = [
      data.employee_id,
      data.branch_id,
      data.member_id || null,
      data.sub_total,
      data.discount_amount || 0,
      data.voucher_discount || 0,
      data.final_amount,
      data.points_earned || 0,
      data.points_multiplier || 1.0,
      data.status || "DRAFT",
      data.table_number || null,
      data.tax_amount || 0,
      data.service_charge || 0,
    ];

    const { rows } = await db.query(insertQuery, values);

    const invoice = rows[0];

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const invoiceCode = `INV-${today}-${String(invoice.id).padStart(6, "0")}`;

    const { rows: updatedRows } = await db.query(
      `
    UPDATE invoices
    SET invoice_code = $1
    WHERE id = $2
    RETURNING *;
    `,
      [invoiceCode, invoice.id],
    );

    return updatedRows[0];
  }

  async createInvoiceDetail(data, client = null) {
    const db = client || pool;

    const query = `
      INSERT INTO invoice_details (
        invoice_id, product_id, product_name, quantity, unit_price
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      data.invoice_id,
      data.product_id || null,
      data.product_name,
      data.quantity,
      data.unit_price,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  async getInvoiceDetails(invoiceId, client = null) {
    const db = client || pool;

    const query = `
      SELECT * FROM invoice_details 
      WHERE invoice_id = $1 
      ORDER BY id ASC
    `;

    const { rows } = await db.query(query, [invoiceId]);
    return rows;
  }

  async createManyInvoiceDetails(details, client = null) {
    const db = client || pool;

    const values = [];
    const placeholders = details
      .map((_, index) => {
        const i = index * 5;
        values.push(
          details[index].invoice_id,
          details[index].product_id || null,
          details[index].product_name,
          details[index].quantity,
          details[index].unit_price,
        );
        return `($${i + 1}, $${i + 2}, $${i + 3}, $${i + 4}, $${i + 5})`;
      })
      .join(", ");

    const query = `
      INSERT INTO invoice_details (invoice_id, product_id, product_name, quantity, unit_price)
      VALUES ${placeholders}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);
    return rows;
  }
  async cancelDraft(invoiceId, cancelledBy, reason = null, client = null) {
    const db = client || pool;

    const query = `
    UPDATE invoices 
    SET 
      status = 'CANCELLED',
      updated_at = NOW()
      -- Bạn có thể thêm cột cancelled_by, cancelled_reason sau
    WHERE id = $1 
      AND status = 'DRAFT'       
    RETURNING *;
  `;

    const { rows } = await db.query(query, [invoiceId]);
    return rows[0];
  }
  async getActivePointConfig(client = null) {
    const db = client || pool;
    const { rows } = await db.query(
      `SELECT * FROM point_configs WHERE is_active = true ORDER BY spend_amount ASC`,
    );
    return rows;
  }
  async updateInvoiceCode(id, invoiceCode, client = null) {
    const db = client || pool;

    const { rows } = await db.query(
      `
    UPDATE invoices
    SET invoice_code = $1
    WHERE id = $2
    RETURNING *;
    `,
      [invoiceCode, id],
    );

    return rows[0];
  }
}

module.exports = new InvoiceRepository();
