const productRepository = require("../../repositories/products/product.repositories");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class CategoryService {
  async getCategoriesAdmin(queryFilters) {
    const { page = 1, limit = 20, search = "", is_active } = queryFilters;

    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 20;
    
    let isActive = null;
    if (is_active !== undefined && is_active !== "") {
      isActive = is_active === "true" || is_active === true;
    }

    const filters = {
      page: parsedPage,
      limit: parsedLimit,
      search,
      isActive,
    };

    const [categories, total] = await Promise.all([
      productRepository.findAllCategoriesAdmin(filters),
      productRepository.countAllCategoriesAdmin(filters),
    ]);

    return {
      categories,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        total_pages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async getCategoryByIdAdmin(id) {
    const category = await productRepository.findCategoryById(id);
    if (!category) {
      throw createError("Không tìm thấy danh mục sản phẩm", 404);
    }
    return category;
  }

  async createCategoryAdmin(data) {
    if (!data.name) {
      throw createError("Tên danh mục không được để trống", 400);
    }
    return await productRepository.createCategory(data);
  }

  async updateCategoryAdmin(id, data) {
    const category = await productRepository.findCategoryById(id);
    if (!category) {
      throw createError("Không tìm thấy danh mục sản phẩm", 404);
    }

    const updated = await productRepository.updateCategory(id, data);
    if (!updated) {
      throw createError("Không có trường dữ liệu nào được cập nhật", 400);
    }
    return updated;
  }

  async deleteCategoryAdmin(id) {
    const category = await productRepository.findCategoryById(id);
    if (!category) {
      throw createError("Không tìm thấy danh mục sản phẩm", 404);
    }
    return await productRepository.deleteCategory(id);
  }
}

module.exports = new CategoryService();
