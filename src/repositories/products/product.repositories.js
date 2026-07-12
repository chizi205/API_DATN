const pool = require("../../config/database");

class ProductRepository {
  async findAll({
    page = 1,
    limit = 20,
    categoryId = null,
    isActive = true,
  } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = `WHERE p.is_active = $${params.length + 1}`;
    params.push(isActive);

    if (categoryId) {
      params.push(categoryId);
      whereClause += ` AND p.category_id = $${params.length}`;
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.base_price,
        p.image_url,
        p.is_active,
        p.created_at,
        c.id AS category_id,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   */
  async findById(id) {
    const query = `
      SELECT 
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Lấy sản phẩm theo category
   */
  async findByCategory(categoryId, { page = 1, limit = 20 } = {}) {
    return this.findAll({ page, limit, categoryId });
  }

  async findAllCategories({ isActive = true } = {}) {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        is_active, 
        created_at, 
        updated_at
      FROM categories
      WHERE is_active = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [isActive]);
    return result.rows;
  }

  /**
   * Lấy chi tiết 1 danh mục theo ID
   */
  async findCategoryById(id) {
    const query = `
      SELECT * FROM categories WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findAllAdmin({ page = 1, limit = 20, search = "", categoryId = null, isActive = null } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = [];

    if (isActive !== null && isActive !== undefined) {
      params.push(isActive === true || isActive === "true");
      whereConditions.push(`p.is_active = $${params.length}`);
    }

    if (categoryId) {
      params.push(categoryId);
      whereConditions.push(`p.category_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(`p.name ILIKE $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const query = `
      SELECT 
        p.id,
        p.category_id,
        p.name,
        p.description,
        p.base_price,
        p.image_url,
        p.is_active,
        p.created_at,
        p.updated_at,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async countAllAdmin({ search = "", categoryId = null, isActive = null } = {}) {
    const params = [];
    let whereConditions = [];

    if (isActive !== null && isActive !== undefined) {
      params.push(isActive === true || isActive === "true");
      whereConditions.push(`is_active = $${params.length}`);
    }

    if (categoryId) {
      params.push(categoryId);
      whereConditions.push(`category_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const query = `
      SELECT COUNT(*) as total 
      FROM products
      ${whereClause}
    `;

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].total, 10);
  }

  async create(data) {
    const query = `
      INSERT INTO products (category_id, name, description, base_price, image_url, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      data.category_id || null,
      data.name,
      data.description || null,
      data.base_price,
      data.image_url || null,
      data.is_active !== undefined ? data.is_active : true,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ["category_id", "name", "description", "base_price", "image_url", "is_active"];
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE products
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async delete(id) {
    const query = `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  // ==================== CATEGORY MANAGEMENT (ADMIN) ====================
  async findAllCategoriesAdmin({ page = 1, limit = 20, search = "", isActive = null } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereConditions = [];

    if (isActive !== null && isActive !== undefined) {
      params.push(isActive === true || isActive === "true");
      whereConditions.push(`is_active = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const query = `
      SELECT id, name, description, is_active, created_at, updated_at
      FROM categories
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const { rows } = await pool.query(query, params);
    return rows;
  }

  async countAllCategoriesAdmin({ search = "", isActive = null } = {}) {
    const params = [];
    let whereConditions = [];

    if (isActive !== null && isActive !== undefined) {
      params.push(isActive === true || isActive === "true");
      whereConditions.push(`is_active = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    const query = `
      SELECT COUNT(*) as total 
      FROM categories
      ${whereClause}
    `;

    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].total, 10);
  }

  async createCategory(data) {
    const query = `
      INSERT INTO categories (name, description, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
      data.name,
      data.description || null,
      data.is_active !== undefined ? data.is_active : true,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async updateCategory(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowedFields = ["name", "description", "is_active"];
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE categories
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
    `;
    values.push(id);

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async deleteCategory(id) {
    const query = `UPDATE categories SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}

module.exports = new ProductRepository();
