const branchesService = require("../../services/branches/branches.service");
const ApiResponse = require("../../utils/response");

class branchesController {
  async getAllStores(req, res, next) {
    try {
      const filters = {
        last_id: req.query.last_id ? parseInt(req.query.last_id) : null,
        limit: req.query.limit || 20,
        is_active: req.query.is_active,
      };

      const result = await branchesService.getAllStores(filters);

      return ApiResponse.success(
        res,
        {
          stores: result.data,
          pagination: {
            limit: result.limit,
            has_more: result.has_more,
            next_last_id: result.next_last_id,
          },
        },
        "Lấy danh sách cửa hàng thành công",
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new branchesController();
