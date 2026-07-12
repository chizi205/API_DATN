const productRepository = require("../../repositories/products/product.repositories");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class ProductService {
  async getProductsAdmin(queryFilters) {
    const { page = 1, limit = 20, search = "", category_id, is_active } = queryFilters;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 20;
    const categoryId = category_id ? parseInt(category_id, 10) : null;
    
    let isActive = null;
    if (is_active !== undefined && is_active !== "") {
      isActive = is_active === "true" || is_active === true;
    }

    const filters = {
      page: parsedPage,
      limit: parsedLimit,
      search,
      categoryId,
      isActive,
    };

    const [products, total] = await Promise.all([
      productRepository.findAllAdmin(filters),
      productRepository.countAllAdmin(filters),
    ]);

    return {
      products,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        total_pages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async getProductByIdAdmin(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw createError("Không tìm thấy sản phẩm", 404);
    }
    return product;
  }

  async createProductAdmin(data) {
    if (!data.name) {
      throw createError("Tên sản phẩm không được để trống", 400);
    }
    if (data.base_price === undefined || data.base_price < 0) {
      throw createError("Giá sản phẩm không hợp lệ", 400);
    }

    // Verify category exists if provided
    if (data.category_id) {
      const category = await productRepository.findCategoryById(data.category_id);
      if (!category) {
        throw createError("Danh mục sản phẩm không tồn tại", 400);
      }
    }

    return await productRepository.create(data);
  }

  async updateProductAdmin(id, data) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw createError("Không tìm thấy sản phẩm", 404);
    }

    // Verify category exists if updated
    if (data.category_id) {
      const category = await productRepository.findCategoryById(data.category_id);
      if (!category) {
        throw createError("Danh mục sản phẩm không tồn tại", 400);
      }
    }

    const updated = await productRepository.update(id, data);
    if (!updated) {
      throw createError("Không có trường dữ liệu nào được cập nhật", 400);
    }
    return updated;
  }

  async deleteProductAdmin(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw createError("Không tìm thấy sản phẩm", 404);
    }
    return await productRepository.delete(id);
  }
}

module.exports = new ProductService();
