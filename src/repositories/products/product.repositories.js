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

  
}

module.exports = new ProductRepository();
