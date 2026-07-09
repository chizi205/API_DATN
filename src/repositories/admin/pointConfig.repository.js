const pool = require("../../config/database");

class PointConfigRepository {
  async getPointConfigs() {
    const query = `
      SELECT * FROM point_configs ORDER BY id ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async createPointConfig(data) {
    const query = `
      INSERT INTO point_configs (spend_amount, earn_points, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      data.spend_amount,
      data.earn_points,
      data.is_active !== undefined ? data.is_active : true,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updatePointConfig(id, data) {
    let setClauses = [];
    let values = [];
    let index = 1;

    const fields = ["spend_amount", "earn_points", "is_active"];
    for (const field of fields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index++}`);
        values.push(data[field]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);

    const query = `
      UPDATE point_configs
      SET ${setClauses.join(", ")}
      WHERE id = $${index++}
      RETURNING *;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async deactivateAllPointConfigs() {
    const query = `
      UPDATE point_configs
      SET is_active = false, updated_at = NOW();
    `;
    await pool.query(query);
  }

  async getTiers() {
    const query = `
      SELECT * FROM membership_tiers ORDER BY min_points ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  async updateTier(id, data) {
    let setClauses = [];
    let values = [];
    let index = 1;

    const fields = ["tier_name", "min_points", "point_multiplier", "color_code"];
    for (const field of fields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index++}`);
        values.push(data[field]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);

    const query = `
      UPDATE membership_tiers
      SET ${setClauses.join(", ")}
      WHERE id = $${index++}
      RETURNING *;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = new PointConfigRepository();
