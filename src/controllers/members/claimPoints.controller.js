const claimPointsService = require("../../services/members/claimPoints.service");
const ApiResponse = require("../../utils/response");

class ClaimPointsController {
  async previewPoints(req, res) {
    try {
      const { token } = req.query;
      const memberId = req.user.id;

      if (!token) {
        return ApiResponse.error(res, "Thiếu token tích điểm", 400);
      }

      const result = await claimPointsService.previewPoints(token, memberId);
      return ApiResponse.success(
        res,
        result,
        "Lấy thông tin xem trước tích điểm thành công",
      );
    } catch (error) {
      console.error("[Preview Points Error]", error);
      const statusCode = error.statusCode || 400;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  async claimPoints(req, res) {
    try {
      const { token } = req.body;
      const memberId = req.user.id;

      if (!token) {
        return ApiResponse.error(res, "Thiếu token tích điểm", 400);
      }

      const result = await claimPointsService.claimPoints(token, memberId);
      return ApiResponse.success(res, result, "Tích điểm thành công");
    } catch (error) {
      console.error("[Claim Points Error]", error);
      const statusCode = error.statusCode || 400;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new ClaimPointsController();
