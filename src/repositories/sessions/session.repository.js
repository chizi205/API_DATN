const pool = require("../../config/database");

class SessionRepository {
  /**
   * Tạo session mới khi nhân viên đăng nhập
   */
  async createSession(data, client = null) {
    const db = client || pool;

    const query = `
      INSERT INTO employee_sessions (
        employee_id,
        token_hash,
        ip_address,
        user_agent,
        device_info,
        is_active,
        login_at,
        last_activity_at
      )
      VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
      RETURNING id, employee_id, login_at, is_active;
    `;

    const values = [
      data.employee_id,
      data.token_hash,
      data.ip_address || null,
      data.user_agent || null,
      data.device_info || null,
    ];

    const { rows } = await db.query(query, values);
    return rows[0];
  }

  /**
   * Lấy tất cả session đang active của một nhân viên
   */
  async findActiveSessionsByEmployee(employeeId, client = null) {
    const db = client || pool;

    const query = `
      SELECT 
        id,
        employee_id,
        ip_address,
        user_agent,
        login_at,
        last_activity_at
      FROM employee_sessions
      WHERE employee_id = $1 
        AND is_active = true
      ORDER BY last_activity_at DESC;
    `;

    const { rows } = await db.query(query, [employeeId]);
    return rows;
  }

  /**
   * Vô hiệu hóa một session cụ thể (Logout 1 thiết bị)
   */
  async deactivateSession(sessionId, client = null) {
    const db = client || pool;

    const query = `
      UPDATE employee_sessions
      SET 
        is_active = false,
        logout_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, employee_id, logout_at;
    `;

    const { rows } = await db.query(query, [sessionId]);
    return rows[0];
  }

  /**
   * Vô hiệu hóa tất cả session của một nhân viên (Logout tất cả thiết bị)
   */
  async deactivateAllSessions(employeeId, client = null) {
    const db = client || pool;

    const query = `
      UPDATE employee_sessions
      SET 
        is_active = false,
        logout_at = NOW(),
        updated_at = NOW()
      WHERE employee_id = $1 
        AND is_active = true
      RETURNING id;
    `;

    const { rows } = await db.query(query, [employeeId]);
    return rows;
  }

  /**
   * Cập nhật thời gian hoạt động gần nhất của session
   */
  async updateLastActivity(sessionId, client = null) {
    const db = client || pool;

    const query = `
      UPDATE employee_sessions
      SET last_activity_at = NOW()
      WHERE id = $1;
    `;

    await db.query(query, [sessionId]);
  }

  /**
   * Tìm session theo token_hash (dùng để kiểm tra token còn hợp lệ)
   */
  async findByTokenHash(tokenHash, client = null) {
    const db = client || pool;

    const query = `
      SELECT *
      FROM employee_sessions
      WHERE token_hash = $1 
        AND is_active = true
      LIMIT 1;
    `;

    const { rows } = await db.query(query, [tokenHash]);
    return rows[0] || null;
  }

  /**
   * Xóa các session cũ (dọn dẹp database)
   */
  async deleteOldSessions(employeeId, days = 30, client = null) {
    const db = client || pool;

    const query = `
      DELETE FROM employee_sessions
      WHERE employee_id = $1 
        AND login_at < NOW() - INTERVAL '${days} days';
    `;

    await db.query(query, [employeeId]);
  }
}

module.exports = new SessionRepository();