const productRepository = require("../../repositories/products/product.repositories");

class ProductService {
  async getAllProducts({
    page = 1,
    limit = 20,
    categoryId = null,
    isActive = true,
  }) {
    return await productRepository.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      categoryId: categoryId ? parseInt(categoryId) : null,
      isActive,
    });
  }

  async getProductById(id) {
    if (!id) {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    const product = await productRepository.findById(parseInt(id));

    if (!product) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    return product;
  }

  async getAllCategories({ isActive = true } = {}) {
    return await productRepository.findAllCategories({ isActive });
  }

  async getCategoryById(id) {
    if (!id) {
      throw new Error("ID danh mục không hợp lệ");
    }
    const category = await productRepository.findCategoryById(parseInt(id));

    if (!category) {
      throw new Error("Không tìm thấy danh mục");
    }

    return category;
  }
}

module.exports = new ProductService();
