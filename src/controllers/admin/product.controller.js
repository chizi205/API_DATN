const productService = require("../../services/admin/product.service");
const ApiResponse = require("../../utils/response");

class ProductController {
  async getProducts(req, res, next) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        category_id: req.query.category_id,
        is_active: req.query.is_active,
      };

      const result = await productService.getProductsAdmin(filters);
      return ApiResponse.success(res, result, "Lấy danh sách sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await productService.getProductByIdAdmin(parseInt(id, 10));
      return ApiResponse.success(res, result, "Lấy chi tiết sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { category_id, name, description, base_price, image_url, is_active } = req.body;
      const result = await productService.createProductAdmin({
        category_id: category_id ? parseInt(category_id, 10) : null,
        name,
        description,
        base_price: parseFloat(base_price),
        image_url,
        is_active,
      });

      return ApiResponse.success(res, result, "Tạo sản phẩm thành công", 201);
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const { category_id, name, description, base_price, image_url, is_active } = req.body;

      const updateData = {};
      if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id, 10) : null;
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (base_price !== undefined) updateData.base_price = parseFloat(base_price);
      if (image_url !== undefined) updateData.image_url = image_url;
      if (is_active !== undefined) updateData.is_active = is_active;

      const result = await productService.updateProductAdmin(parseInt(id, 10), updateData);
      return ApiResponse.success(res, result, "Cập nhật sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const result = await productService.deleteProductAdmin(parseInt(id, 10));
      return ApiResponse.success(res, result, "Xóa sản phẩm thành công");
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
