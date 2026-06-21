const pool = require("../../config/database");

class branchesRepo {
  async getAllStoresService(filters = {}) {
    const { last_id = null, limit = 20, is_active } = filters;

    const values = [];
    let paramIndex = 1;

    let whereConditions = [];

    // Lọc theo last_id (cursor)
    if (last_id) {
      whereConditions.push(`id > $${paramIndex}`);
      values.push(last_id);
      paramIndex++;
    }

    if (is_active !== undefined) {
      whereConditions.push(`is_active = $${paramIndex}`);
      values.push(is_active === true || is_active === "true");
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    const take = parseInt(limit) + 1;

    const query = `
    SELECT id, name, address, phone, is_active, created_at, updated_at
    FROM branches
    ${whereClause}
    ORDER BY id ASC
    LIMIT $${paramIndex}
  `;
    values.push(take);

    const result = await pool.query(query, values);
    const rows = result.rows;

    const has_more = rows.length > limit;
    const data = has_more ? rows.slice(0, limit) : rows;

    const next_last_id = data.length > 0 ? data[data.length - 1].id : null;

    return {
      data,
      next_last_id,
      has_more,
      limit: parseInt(limit),
    };
  }
}

module.exports = new branchesRepo();