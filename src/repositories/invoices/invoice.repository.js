const pool = require("../../config/database");

class InvoiceRepository {
  async create(data, client = null) {
    const db = client || pool;

    const insertQuery = `
    INSERT INTO invoices (
      employee_id, branch_id, member_id,
      sub_total, discount_amount, voucher_discount, final_amount,
      points_earned, points_multiplier, status, table_number,
      tax_amount, service_charge, claim_qr_token, claim_qr_expired_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15
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
      data.claim_qr_token || null,
      data.claim_qr_expired_at || null,
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
  async findById(id, client = null) {
    const db = client || pool;

    const query = `
      SELECT 
        i.*,
        pm.name AS payment_method_name,
        pm.code AS payment_method_code
      FROM invoices i
      LEFT JOIN payment_methods pm ON i.payment_method_id = pm.id
      WHERE i.id = $1
    `;

    const { rows } = await db.query(query, [id]);
    return rows[0] || null;
  }

  async markAsPaid(invoiceId, paymentMethod, paymentMethodId, client = null) {
    const db = client || pool;

    const findQuery = `SELECT member_id, applied_member_voucher_id FROM invoices WHERE id = $1`;
    const { rows: findRows } = await db.query(findQuery, [invoiceId]);
    const appliedMemberVoucherId = findRows[0]?.applied_member_voucher_id;

    const query = `
      UPDATE invoices 
      SET 
        status = 'COMPLETED',
        payment_method_id = $1,
        payment_method = $2,
        paid_at = NOW(),
        updated_at = NOW()
      WHERE id = $3 
      RETURNING 
        id, 
        invoice_code, 
        status, 
        payment_method_id, 
        paid_at,
        final_amount,
        member_id,
        points_earned,
        points_multiplier,
        applied_member_voucher_id,
        claim_qr_token,
        claim_qr_expired_at;
    `;

    const { rows } = await db.query(query, [
      paymentMethodId,
      paymentMethod,
      invoiceId,
    ]);

    if (appliedMemberVoucherId) {
      await db.query(
        `UPDATE member_vouchers SET status = 'USED', used_at = NOW(), used_invoice_id = $1 WHERE id = $2`,
        [invoiceId, appliedMemberVoucherId]
      );
    }

    return rows[0];
  }
  async updatePaymentMethod(
    invoiceId,
    paymentMethod,
    paymentMethodId,
    client = null,
  ) {
    const db = client || pool;

    const query = `
      UPDATE invoices 
      SET 
        payment_method_id = $1,
        payment_method = $2,
        updated_at = NOW()
      WHERE id = $3 
      RETURNING 
        id, 
        invoice_code, 
        status, 
        payment_method_id, 
        paid_at,
        final_amount,
        member_id,
        points_earned,
        points_multiplier,
        applied_member_voucher_id;
    `;

    const { rows } = await db.query(query, [
      paymentMethodId,
      paymentMethod,
      invoiceId,
    ]);
    return rows[0];
  }
  async markAsFailed(invoiceId, client = null) {
    const db = client || pool;

    const query = `
    UPDATE invoices 
    SET 
      status = 'DRAFT',           
      updated_at = NOW()
    WHERE id = $1
    RETURNING id, invoice_code, status, updated_at;
  `;

    const { rows } = await db.query(query, [invoiceId]);
    return rows[0];
  }
  async updateMemberAndPoints(
    invoiceId,
    memberId,
    pointsMultiplier,
    pointsEarned,
    client = null,
  ) {
    const queryClient = client || pool;

    const query = `
    UPDATE invoices 
    SET 
      member_id = $1,
      points_multiplier = $2,
      points_earned = $3,
      updated_at = NOW()
    WHERE id = $4
    RETURNING *;
  `;

    const result = await queryClient.query(query, [
      memberId,
      pointsMultiplier,
      pointsEarned,
      invoiceId,
    ]);

    return result.rows[0] || null;
  }

  async findAll(filters = {}, client = null) {
    const db = client || pool;

    const {
      limit = 20,
      last_id,
      status,
      branch_id,
      member_id,
      employee_id,
      from_date,
      to_date,
      today,
      search,
      sort_order = "DESC",
    } = filters;

    const safeLimit = Math.min(parseInt(limit) || 20, 100);

    let whereConditions = [];
    let values = [];
    let paramIndex = 1;

    // ==================== FILTER CƠ BẢN ====================
    if (status) {
      whereConditions.push(`i.status = $${paramIndex++}`);
      values.push(status);
    }
    if (branch_id) {
      whereConditions.push(`i.branch_id = $${paramIndex++}`);
      values.push(branch_id);
    }
    if (member_id) {
      whereConditions.push(`i.member_id = $${paramIndex++}`);
      values.push(member_id);
    }
    if (employee_id) {
      whereConditions.push(`i.employee_id = $${paramIndex++}`);
      values.push(employee_id);
    }

    // ==================== LỌC THEO NGÀY ====================
    if (today === true || today === "true") {
      // Lấy hóa đơn trong ngày hôm nay (theo giờ Việt Nam)
      whereConditions.push(
        `DATE(i.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = CURRENT_DATE`,
      );
    } else {
      if (from_date) {
        whereConditions.push(`i.created_at >= $${paramIndex++}`);
        values.push(from_date);
      }
      if (to_date) {
        whereConditions.push(`i.created_at <= $${paramIndex++}`);
        values.push(to_date + " 23:59:59");
      }
    }

    if (search) {
      whereConditions.push(
        `(i.invoice_code ILIKE $${paramIndex} OR m.phone ILIKE $${paramIndex})`,
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    // ==================== KEYSET PAGINATION ====================
    if (last_id) {
      if (sort_order.toUpperCase() === "DESC") {
        whereConditions.push(`i.id < $${paramIndex++}`);
      } else {
        whereConditions.push(`i.id > $${paramIndex++}`);
      }
      values.push(last_id);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // ==================== QUERY ====================
    const query = `
    SELECT 
      i.id,
      i.invoice_code,
      i.status,
      i.final_amount,
      i.points_earned,
      i.points_multiplier,
      i.created_at,
      i.paid_at,
      b.name AS branch_name,
      e.full_name AS employee_name,
      m.full_name AS member_name,
      m.phone_number AS member_phone,
      pm.name AS payment_method_name  
    FROM invoices i
    LEFT JOIN branches b ON i.branch_id = b.id
    LEFT JOIN employees e ON i.employee_id = e.id
    LEFT JOIN members m ON i.member_id = m.id
    LEFT JOIN payment_methods pm ON i.payment_method_id = pm.id
    ${whereClause}
    ORDER BY i.id ${sort_order}
    LIMIT $${paramIndex}
  `;

    values.push(safeLimit);

    const { rows } = await db.query(query, values);

    const hasMore = rows.length === safeLimit;
    const nextLastId = hasMore ? rows[rows.length - 1].id : null;

    return {
      data: rows,
      pagination: {
        limit: safeLimit,
        has_more: hasMore,
        last_id: nextLastId,
        sort_order,
      },
    };
  }
  async findDetailById(id, client = null) {
    const db = client || pool;

    // Lấy thông tin hóa đơn + join các bảng liên quan
    const invoiceQuery = `
    SELECT 
      i.*,
      b.name AS branch_name,
      e.full_name AS employee_name,
      m.id AS member_id,
      m.full_name AS member_name,
      m.phone_number AS member_phone,

      pm.name AS payment_method_name,
      pm.code AS payment_method_code,
      v.code AS voucher_code
    FROM invoices i
    LEFT JOIN branches b ON i.branch_id = b.id
    LEFT JOIN employees e ON i.employee_id = e.id
    LEFT JOIN members m ON i.member_id = m.id
    LEFT JOIN payment_methods pm ON i.payment_method_id = pm.id
    LEFT JOIN vouchers v ON i.applied_member_voucher_id = v.id
    WHERE i.id = $1
  `;

    const { rows: invoiceRows } = await db.query(invoiceQuery, [id]);
    const invoice = invoiceRows[0];

    if (!invoice) return null;

    const details = await this.getInvoiceDetails(id, client);

    return {
      ...invoice,
      details,
    };
  }

  async applyVoucherToInvoice(invoiceId, memberVoucherId, voucherDiscount, finalAmount, pointsEarned, client = null) {
    const db = client || pool;
    const query = `
      UPDATE invoices
      SET 
        applied_member_voucher_id = $1,
        voucher_discount = $2,
        final_amount = $3,
        points_earned = $4,
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;
    const { rows } = await db.query(query, [
      memberVoucherId,
      voucherDiscount,
      finalAmount,
      pointsEarned,
      invoiceId
    ]);
    return rows[0] || null;
  }
}

module.exports = new InvoiceRepository();
