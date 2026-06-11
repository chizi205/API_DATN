const pool = require("../../config/database");

class EmployeeRepository {
  async findForLogin(identifier) {
    const query = `
      SELECT 
        e.*,
        b.name AS branch_name,
        b.address AS branch_address
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE (e.employee_code = $1 OR e.email = $1)
        AND e.is_active = true
      LIMIT 1;
    `;
    const result = await pool.query(query, [identifier]);
    return result.rows[0] || null;
  }

  async updateRefreshToken(employeeId, refreshToken) {
    const query = `
      UPDATE employees 
      SET refresh_token = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id;
    `;
    const result = await pool.query(query, [refreshToken, employeeId]);
    return result.rows[0] || null;
  }

  async clearRefreshToken(employeeId) {
    const query = `
      UPDATE employees 
      SET refresh_token = NULL, updated_at = NOW()
      WHERE id = $1;
    `;
    await pool.query(query, [employeeId]);
    return true;
  }

  async findByRefreshToken(refreshToken) {
    const query = `
      SELECT e.*, b.name AS branch_name
      FROM employees e
      LEFT JOIN branches b ON e.branch_id = b.id
      WHERE e.refresh_token = $1 AND e.is_active = true
      LIMIT 1;
    `;
    const result = await pool.query(query, [refreshToken]);
    return result.rows[0] || null;
  }

  async updateLastLogin(employeeId) {
    const query = `
      UPDATE employees 
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1;
    `;
    await pool.query(query, [employeeId]);
  }
}

module.exports = new EmployeeRepository();