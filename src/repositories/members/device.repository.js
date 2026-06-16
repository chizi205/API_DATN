const pool = require("../../config/database");

class DeviceRepository {
  async registerDevice(userId, fcmToken, deviceInfo = {}) {
    const query = `
      INSERT INTO user_devices (user_id, token, device_info, is_active, last_used_at)
      VALUES ($1, $2, $3, true, NOW())
      ON CONFLICT (token) 
      DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        device_info = EXCLUDED.device_info,
        is_active = true,
        last_used_at = NOW(),
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await pool.query(query, [userId, fcmToken, deviceInfo]);
    return result.rows[0];
  }

  async getActiveTokensByUserId(userId) {
    const query = `
      SELECT token 
      FROM user_devices 
      WHERE user_id = $1 AND is_active = true
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map((row) => row.token);
  }

  async deactivateToken(fcmToken) {
    const query = `
      UPDATE user_devices 
      SET is_active = false, updated_at = NOW()
      WHERE token = $1
    `;
    await pool.query(query, [fcmToken]);
  }
  async removeInvalidTokens(tokens, client = null) {
    const db = client || pool;

    if (!tokens || tokens.length === 0) return;

    const query = `
    DELETE FROM user_devices 
    WHERE token = ANY($1::text[])
  `;

    await db.query(query, [tokens]);
    console.log(`🗑️ Đã xóa ${tokens.length} token không hợp lệ`);
  }
}

module.exports = new DeviceRepository();
