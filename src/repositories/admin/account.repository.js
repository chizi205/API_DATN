const pool = require("../../config/database");

class AccountRepository {
  async getAllEmployees(limit = 20, offset = 0) {
    const query = `
      SELECT id, employee_code, full_name, email, role, branch_id, is_active, created_at, updated_at
      FROM employees
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
  }

  async findById(id) {
    const query = `
      SELECT id, employee_code, full_name, email, role, branch_id, is_active, created_at, updated_at
      FROM employees
      WHERE id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async findByEmailOrCode(email, employeeCode) {
    const query = `
      SELECT id FROM employees WHERE email = $1 OR employee_code = $2 LIMIT 1;
    `;
    const { rows } = await pool.query(query, [email, employeeCode]);
    return rows[0] || null;
  }

  async createEmployee(data) {
    const query = `
      INSERT INTO employees (employee_code, full_name, email, password, role, branch_id, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, employee_code, full_name, email, role, branch_id, is_active, created_at;
    `;
    const values = [
      data.employee_code,
      data.full_name,
      data.email,
      data.password, // already hashed
      data.role || "STAFF",
      data.branch_id || null,
      data.is_active !== undefined ? data.is_active : true,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateEmployee(id, data) {
    let setClauses = [];
    let values = [];
    let index = 1;

    const fields = ["full_name", "email", "password", "role", "branch_id", "is_active"];
    for (const field of fields) {
      if (data[field] !== undefined) {
        setClauses.push(`${field} = $${index++}`);
        values.push(data[field]);
      }
    }

    if (setClauses.length === 0) return null;

    setClauses.push(`updated_at = NOW()`);

    const query = `
      UPDATE employees
      SET ${setClauses.join(", ")}
      WHERE id = $${index++}
      RETURNING id, employee_code, full_name, email, role, branch_id, is_active, updated_at;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async deleteEmployee(id) {
    const query = `
      UPDATE employees
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
}

module.exports = new AccountRepository();
