const pool = require("../../config/database");
const bcrypt = require("bcrypt");

function convertDateToISO(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

class AuthRepository {
  generateBarcode(memberId) {
    const paddedId = String(memberId).padStart(8, "0");
    return `BC${paddedId}`;
  }

  async hashRefreshToken(token) {
    const saltRounds = 10;
    return await bcrypt.hash(token, saltRounds);
  }

  // ==================== MEMBER ====================

  async findByPhone(phone) {
    const result = await pool.query(
      "SELECT * FROM members WHERE phone_number = $1",
      [phone]
    );
    return result.rows[0];
  }

  async create(data) {
    const insertQuery = `
      INSERT INTO members 
        (phone_number, full_name, tier_id, current_points, total_accumulated_points, barcode)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      data.phone_number,
      data.full_name || null,
      data.tier_id,
      data.current_points || 0,
      data.total_accumulated_points || 0,
      null,
    ];

    const insertResult = await pool.query(insertQuery, values);
    const newMember = insertResult.rows[0];

    const barcode = this.generateBarcode(newMember.id);

    const updateQuery = `
      UPDATE members SET barcode = $1 WHERE id = $2 RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [barcode, newMember.id]);
    return updateResult.rows[0];
  }

  async getDefaultTier() {
    const query = `SELECT id FROM membership_tiers ORDER BY min_points ASC LIMIT 1`;
    const result = await pool.query(query);
    return result.rows[0] ? result.rows[0].id : null;
  }

  async updateProfile(memberId, data) {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.full_name !== undefined) {
      fields.push(`full_name = $${index++}`);
      values.push(data.full_name);
    }
    if (data.email !== undefined) {
      fields.push(`email = $${index++}`);
      values.push(data.email);
    }
    if (data.date_of_birth !== undefined) {
      const isoDate = convertDateToISO(data.date_of_birth);
      fields.push(`date_of_birth = $${index++}`);
      values.push(isoDate);
    }
    if (data.gender !== undefined) {
      const allowed = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];
      const normalized = String(data.gender).toUpperCase().trim();
      if (!allowed.includes(normalized)) {
        throw new Error("Giá trị giới tính không hợp lệ");
      }
      fields.push(`gender = $${index++}`);
      values.push(normalized);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(memberId);

    const query = `UPDATE members SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ==================== REFRESH TOKEN (Bảng mới) ====================

  async createRefreshToken({ memberId, tokenHash, deviceName, ipAddress, userAgent, expiresAt }) {
    const query = `
      INSERT INTO refresh_tokens 
        (member_id, token_hash, device_name, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      memberId,
      tokenHash,
      deviceName || null,
      ipAddress || null,
      userAgent || null,
      expiresAt,
    ]);
    return result.rows[0];
  }

  async findByRefreshToken(rawToken) {
    const result = await pool.query(`
      SELECT rt.*, m.* 
      FROM refresh_tokens rt
      JOIN members m ON rt.member_id = m.id
      WHERE rt.expires_at > NOW()
    `);

    for (const row of result.rows) {
      const isMatch = await bcrypt.compare(rawToken, row.token_hash);
      if (isMatch) {
        return row; 
      }
    }
    return null;
  }

  async deleteRefreshTokenByHash(tokenHash) {
    await pool.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [tokenHash]);
    return true;
  }

  async deleteAllRefreshTokensByMemberId(memberId) {
    await pool.query(`DELETE FROM refresh_tokens WHERE member_id = $1`, [memberId]);
    return true;
  }

  async deleteRefreshTokenById(id) {
    await pool.query(`DELETE FROM refresh_tokens WHERE id = $1`, [id]);
    return true;
  }
}

module.exports = new AuthRepository();