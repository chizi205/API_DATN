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

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM members ORDER BY created_at DESC",
    );
    return result.rows;
  }

  async findById(id) {
    const result = await pool.query("SELECT * FROM members WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  async findByPhone(phone) {
    const result = await pool.query(
      "SELECT * FROM members WHERE phone_number = $1",
      [phone],
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
      UPDATE members 
      SET barcode = $1 
      WHERE id = $2 
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [barcode, newMember.id]);
    return updateResult.rows[0];
  }

  async getDefaultTier() {
    const query = `
    SELECT id 
    FROM membership_tiers 
    ORDER BY min_points ASC 
    LIMIT 1
  `;
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
      const allowedGenders = ["MALE", "FEMALE", "OTHER", "UNKNOWN"];
      const normalizedGender = String(data.gender).toUpperCase().trim();

      if (!allowedGenders.includes(normalizedGender)) {
        throw new Error(
          "Giá trị giới tính không hợp lệ. Chỉ chấp nhận: MALE, FEMALE, OTHER, UNKNOWN",
        );
      }

      fields.push(`gender = $${index++}`);
      values.push(normalizedGender);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const query = `
    UPDATE members 
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;
    values.push(memberId);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async updateRefreshToken(memberId, refreshToken) {
    const hashedToken = await this.hashRefreshToken(refreshToken);

    const query = `
    UPDATE members 
    SET refresh_token_hash = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
    const result = await pool.query(query, [hashedToken, memberId]);
    return result.rows[0];
  }

  async findByRefreshToken(rawToken) {
    const result = await pool.query(
      "SELECT * FROM members WHERE refresh_token_hash IS NOT NULL",
    );

    for (const member of result.rows) {
      const isMatch = await bcrypt.compare(rawToken, member.refresh_token_hash);
      if (isMatch) {
        return member;
      }
    }
    return null;
  }
  async clearRefreshToken(memberId) {
    const query = `
    UPDATE members 
    SET refresh_token_hash = NULL, updated_at = NOW()
    WHERE id = $1
  `;
    await pool.query(query, [memberId]);
    return true;
  }
}
module.exports = new AuthRepository();
