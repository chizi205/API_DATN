const pointConfigRepository = require("../../repositories/admin/pointConfig.repository");
const ApiResponse = require("../../utils/response");

class PointConfigController {
  async getConfigs(req, res) {
    try {
      const configs = await pointConfigRepository.getPointConfigs();
      return ApiResponse.success(res, configs, "Lấy danh sách cấu hình điểm thành công");
    } catch (error) {
      console.error("Get Point Configs Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy cấu hình điểm");
    }
  }

  async createConfig(req, res) {
    try {
      const { spend_amount, earn_points, is_active } = req.body;

      if (!spend_amount || !earn_points) {
        return ApiResponse.error(res, "Vui lòng nhập đầy đủ spend_amount và earn_points", 400);
      }

      if (is_active === true) {
        await pointConfigRepository.deactivateAllPointConfigs();
      }

      const newConfig = await pointConfigRepository.createPointConfig({
        spend_amount,
        earn_points,
        is_active,
      });

      return ApiResponse.created(res, newConfig, "Tạo cấu hình điểm thành công");
    } catch (error) {
      console.error("Create Point Config Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi tạo cấu hình điểm");
    }
  }

  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { spend_amount, earn_points, is_active } = req.body;

      if (is_active === true) {
        await pointConfigRepository.deactivateAllPointConfigs();
      }

      const updated = await pointConfigRepository.updatePointConfig(id, {
        spend_amount,
        earn_points,
        is_active,
      });

      if (!updated) {
        return ApiResponse.notFound(res, "Cấu hình điểm không tồn tại");
      }

      return ApiResponse.success(res, updated, "Cập nhật cấu hình điểm thành công");
    } catch (error) {
      console.error("Update Point Config Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật cấu hình điểm");
    }
  }

  async getTiers(req, res) {
    try {
      const tiers = await pointConfigRepository.getTiers();
      return ApiResponse.success(res, tiers, "Lấy danh sách hạng thành viên thành công");
    } catch (error) {
      console.error("Get Tiers Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy hạng thành viên");
    }
  }

  async updateTier(req, res) {
    try {
      const { id } = req.params;
      const { tier_name, min_points, point_multiplier, color_code } = req.body;

      const updated = await pointConfigRepository.updateTier(id, {
        tier_name,
        min_points,
        point_multiplier,
        color_code,
      });

      if (!updated) {
        return ApiResponse.notFound(res, "Hạng thành viên không tồn tại");
      }

      return ApiResponse.success(res, updated, "Cập nhật hạng thành viên thành công");
    } catch (error) {
      console.error("Update Tier Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật hạng thành viên");
    }
  }
}

module.exports = new PointConfigController();
