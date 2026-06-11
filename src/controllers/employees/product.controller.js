const productService = require("../../services/products/product.service");
const ApiResponse = require("../../utils/response");

const getAllProductsController = async (req, res) => {
  try {
    const { page = 1, limit = 20, category_id, is_active } = req.query;

    const products = await productService.getAllProducts({
      page,
      limit,
      categoryId: category_id,
      isActive: is_active !== undefined ? is_active === "true" : true,
    });

    return ApiResponse.success(
      res,
      products,
      "Lấy danh sách sản phẩm thành công",
    );
  } catch (error) {
    console.error("Get Products Controller Error:", error);
    return ApiResponse.error(res, error.message, 500);
  }
};

const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    return ApiResponse.success(
      res,
      product,
      "Lấy chi tiết sản phẩm thành công",
    );
  } catch (error) {
    console.error("Get Product By ID Controller Error:", error);

    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 500;
    return ApiResponse.error(res, error.message, statusCode);
  }
};
const getAllCategoriesController = async (req, res) => {
  try {
    const { is_active } = req.query;

    const categories = await productService.getAllCategories({
      isActive: is_active !== undefined ? is_active === "true" : true,
    });

    return ApiResponse.success(
      res,
      categories,
      "Lấy danh sách danh mục thành công",
    );
  } catch (error) {
    console.error("Get Categories Controller Error:", error);
    return ApiResponse.error(res, error.message, 500);
  }
};

const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await productService.getCategoryById(parseInt(id));

    if (!category) {
      return ApiResponse.error(res, "Không tìm thấy danh mục", 404);
    }

    return ApiResponse.success(
      res,
      category,
      "Lấy chi tiết danh mục thành công",
    );
  } catch (error) {
    console.error("Get Category By ID Controller Error:", error);
    return ApiResponse.error(res, error.message, 500);
  }
};


module.exports = {
  getAllProductsController,
  getProductByIdController,
  getAllCategoriesController,
  getCategoryByIdController,
};
