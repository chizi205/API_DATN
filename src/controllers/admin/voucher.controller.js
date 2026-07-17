const voucherRepository = require("../../repositories/admin/voucher.repository");
const ApiResponse = require("../../utils/response");

class VoucherController {
  async getVouchers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;

      const vouchers = await voucherRepository.getAllVouchers(limit, offset);
      return ApiResponse.success(res, vouchers, "Lấy danh sách ưu đãi thành công");
    } catch (error) {
      console.error("Get Vouchers Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy danh sách ưu đãi");
    }
  }

  async getVoucherById(req, res) {
    try {
      const { id } = req.params;
      const voucher = await voucherRepository.findById(id);

      if (!voucher) {
        return ApiResponse.notFound(res, "Ưu đãi không tồn tại");
      }

      return ApiResponse.success(res, voucher, "Lấy chi tiết ưu đãi thành công");
    } catch (error) {
      console.error("Get Voucher By ID Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi lấy chi tiết ưu đãi");
    }
  }

  async createVoucher(req, res) {
    try {
      let {
        code, title, discount_type, discount_value, max_discount,
        point_cost, stock_quantity, applicable_tiers, valid_from,
        valid_to, expiry_days, is_active
      } = req.body;

      if (!code || !title || !discount_type || discount_value === undefined) {
        return ApiResponse.error(res, "Vui lòng nhập đầy đủ mã, tiêu đề, loại giảm giá và giá trị giảm giá", 400);
      }

      let normalizedType = discount_type.toString().toUpperCase();
      if (normalizedType === "PERCENTAGE") {
        normalizedType = "PERCENT";
      }

      if (normalizedType !== "PERCENT" && normalizedType !== "FIXED") {
        return ApiResponse.error(res, "Loại giảm giá không hợp lệ. Chỉ chấp nhận FIXED hoặc PERCENT/PERCENTAGE", 400);
      }

      const existing = await voucherRepository.findByCode(code);
      if (existing) {
        return ApiResponse.error(res, "Mã ưu đãi đã được sử dụng", 400);
      }

      const newVoucher = await voucherRepository.createVoucher({
        code,
        title,
        discount_type: normalizedType,
        discount_value,
        max_discount,
        point_cost,
        stock_quantity,
        applicable_tiers,
        valid_from,
        valid_to,
        expiry_days,
        is_active,
      });

      return ApiResponse.created(res, newVoucher, "Tạo ưu đãi thành công");
    } catch (error) {
      console.error("Create Voucher Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi tạo ưu đãi");
    }
  }

  async updateVoucher(req, res) {
    try {
      const { id } = req.params;
      const data = { ...req.body };

      const voucher = await voucherRepository.findById(id);
      if (!voucher) {
        return ApiResponse.notFound(res, "Ưu đãi không tồn tại");
      }

      if (data.code && data.code !== voucher.code) {
        const existing = await voucherRepository.findByCode(data.code);
        if (existing) {
          return ApiResponse.error(res, "Mã ưu đãi mới đã được sử dụng", 400);
        }
      }

      if (data.discount_type) {
        let normalizedType = data.discount_type.toString().toUpperCase();
        if (normalizedType === "PERCENTAGE") {
          normalizedType = "PERCENT";
        }
        if (normalizedType !== "PERCENT" && normalizedType !== "FIXED") {
          return ApiResponse.error(res, "Loại giảm giá không hợp lệ. Chỉ chấp nhận FIXED hoặc PERCENT/PERCENTAGE", 400);
        }
        data.discount_type = normalizedType;
      }

      const updatedVoucher = await voucherRepository.updateVoucher(id, data);
      return ApiResponse.success(res, updatedVoucher, "Cập nhật ưu đãi thành công");
    } catch (error) {
      console.error("Update Voucher Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi cập nhật ưu đãi");
    }
  }

  async deleteVoucher(req, res) {
    try {
      const { id } = req.params;

      const voucher = await voucherRepository.findById(id);
      if (!voucher) {
        return ApiResponse.notFound(res, "Ưu đãi không tồn tại");
      }

      await voucherRepository.deleteVoucher(id);
      return ApiResponse.success(res, null, "Vô hiệu hóa ưu đãi thành công");
    } catch (error) {
      console.error("Delete Voucher Error:", error);
      return ApiResponse.serverError(res, "Lỗi server khi vô hiệu hóa ưu đãi");
    }
  }
}

module.exports = new VoucherController();
