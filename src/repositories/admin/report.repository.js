const pool = require("../../config/database");

class ReportRepository {
  async getDashboardOverview() {
    const revenueQuery = `
      SELECT COALESCE(SUM(final_amount), 0) as total_revenue, COUNT(id) as total_orders
      FROM invoices
      WHERE status = 'COMPLETED';
    `;

    const membersQuery = `
      SELECT COUNT(id) as total_members FROM members;
    `;

    const vouchersRedeemedQuery = `
      SELECT COUNT(id) as total_vouchers_redeemed FROM member_vouchers;
    `;

    const { rows: revenueRows } = await pool.query(revenueQuery);
    const { rows: membersRows } = await pool.query(membersQuery);
    const { rows: voucherRows } = await pool.query(vouchersRedeemedQuery);

    return {
      total_revenue: parseFloat(revenueRows[0].total_revenue),
      total_orders: parseInt(revenueRows[0].total_orders),
      total_members: parseInt(membersRows[0].total_members),
      total_vouchers_redeemed: parseInt(voucherRows[0].total_vouchers_redeemed),
    };
  }

  async getRevenueStats(startDate, endDate) {
    let query = `
      SELECT 
        TO_CHAR(paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as date, 
        COALESCE(SUM(final_amount), 0) as revenue, 
        COUNT(id) as order_count
      FROM invoices
      WHERE status = 'COMPLETED'
    `;
    const params = [];
    let index = 1;

    if (startDate) {
      query += ` AND TO_CHAR(paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') >= $${index++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND TO_CHAR(paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') <= $${index++}`;
      params.push(endDate);
    }

    query += `
      GROUP BY TO_CHAR(paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')
      ORDER BY date ASC;
    `;
    console.log(query)

    const { rows } = await pool.query(query, params);
    return rows.map(r => ({
      date: r.date,
      revenue: parseFloat(r.revenue),
      order_count: parseInt(r.order_count)
    }));
  }

  async getMemberDistribution() {
    const query = `
      SELECT 
        COALESCE(t.tier_name, 'Chưa có hạng') as tier_name, 
        COUNT(m.id) as count
      FROM members m
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      GROUP BY t.id, t.tier_name
      ORDER BY t.min_points ASC NULLS FIRST;
    `;
    const { rows } = await pool.query(query);
    return rows.map(r => ({
      tier_name: r.tier_name,
      count: parseInt(r.count)
    }));
  }

  async getTopSpenders(limit = 10) {
    const query = `
      SELECT 
        m.id, 
        m.full_name, 
        m.phone_number,
        COALESCE(t.tier_name, 'Chưa có hạng') as tier_name,
        COALESCE(SUM(i.final_amount), 0) as total_spent, 
        COUNT(i.id) as orders_count
      FROM invoices i
      JOIN members m ON i.member_id = m.id
      LEFT JOIN membership_tiers t ON m.tier_id = t.id
      WHERE i.status = 'COMPLETED'
      GROUP BY m.id, m.full_name, m.phone_number, t.tier_name
      ORDER BY total_spent DESC
      LIMIT $1;
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows.map(r => ({
      id: r.id,
      full_name: r.full_name,
      phone_number: r.phone_number,
      tier_name: r.tier_name,
      total_spent: parseFloat(r.total_spent),
      orders_count: parseInt(r.orders_count)
    }));
  }

  async getTopSellingProducts(limit = 10) {
    const query = `
      SELECT 
        product_name, 
        SUM(quantity) as quantity_sold, 
        SUM(quantity * unit_price) as revenue
      FROM invoice_details id
      JOIN invoices i ON id.invoice_id = i.id
      WHERE i.status = 'COMPLETED'
      GROUP BY product_name
      ORDER BY quantity_sold DESC
      LIMIT $1;
    `;
    const { rows } = await pool.query(query, [limit]);
    return rows.map(r => ({
      product_name: r.product_name,
      quantity_sold: parseInt(r.quantity_sold),
      revenue: parseFloat(r.revenue)
    }));
  }

  async getMonthlyRevenueStats(year) {
    const query = `
      SELECT 
        EXTRACT(MONTH FROM paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as month,
        COALESCE(SUM(final_amount), 0) as revenue,
        COUNT(id) as order_count
      FROM invoices
      WHERE status = 'COMPLETED'
        AND EXTRACT(YEAR FROM paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') = $1
      GROUP BY EXTRACT(MONTH FROM paid_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')
      ORDER BY month ASC;
    `;
    const { rows } = await pool.query(query, [year]);

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      order_count: 0
    }));

    rows.forEach(r => {
      const m = parseInt(r.month, 10);
      if (m >= 1 && m <= 12) {
        monthlyStats[m - 1].revenue = parseFloat(r.revenue);
        monthlyStats[m - 1].order_count = parseInt(r.order_count, 10);
      }
    });

    return monthlyStats;
  }
}

module.exports = new ReportRepository();
