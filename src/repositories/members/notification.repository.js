const pool = require("../../config/database");

class NotificationRepository {
  async createNotification(data, client = null) {
    const queryExecutor = client || pool;
    const query = `
      INSERT INTO notifications (
        member_id, title, body, type, reference_id, reference_type, is_read, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
      RETURNING *;
    `;
    const values = [
      data.member_id || null, // Allow NULL for system-wide notifications
      data.title,
      data.body,
      data.type,
      data.reference_id || null,
      data.reference_type || null,
    ];
    const { rows } = await queryExecutor.query(query, values);
    return rows[0];
  }

  async getNotificationsByMember(memberId, limit = 20, offset = 0) {
    const query = `
      SELECT * 
      FROM notifications
      WHERE member_id = $1 OR member_id IS NULL
      ORDER BY id DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows } = await pool.query(query, [memberId, limit, offset]);
    return rows;
  }

  async findById(id) {
    const query = `SELECT * FROM notifications WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async markAsRead(id, memberId) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND (member_id = $2 OR member_id IS NULL)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id, memberId]);
    return rows[0] || null;
  }

  async markAllAsRead(memberId) {
    const query = `
      UPDATE notifications
      SET is_read = true, read_at = NOW()
      WHERE (member_id = $1 OR member_id IS NULL) AND is_read = false
      RETURNING id;
    `;
    const { rows } = await pool.query(query, [memberId]);
    return rows;
  }
}

module.exports = new NotificationRepository();
