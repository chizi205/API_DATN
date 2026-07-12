const categoryService = require("../../services/admin/category.service");
const ApiResponse = require("../../utils/response");

class CategoryController {
  async getCategories(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        is_active: req.query.is_active,
      };

      const result = await categoryService.getCategoriesAdmin(filters);
      return ApiResponse.success(res, result, "Lấy danh sách danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await categoryService.getCategoryByIdAdmin(parseInt(id, 10));
      return ApiResponse.success(res, result, "Lấy chi tiết danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const { name, description, is_active } = req.body;
      const result = await categoryService.createCategoryAdmin({
        name,
        description,
        is_active,
      });

      return ApiResponse.success(res, result, "Tạo danh mục thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, is_active } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (is_active !== undefined) updateData.is_active = is_active;

      const result = await categoryService.updateCategoryAdmin(parseInt(id, 10), updateData);
      return ApiResponse.success(res, result, "Cập nhật danh mục thành công");
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await categoryService.deleteCategoryAdmin(parseInt(id, 10));
      return ApiResponse.success(res, result, "Xóa danh mục thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
