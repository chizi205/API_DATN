const voucherService = require("../../services/members/voucher.service");
const ApiResponse = require("../../utils/response");

const getRedeemableVouchersController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const vouchers = await voucherService.getRedeemableVouchers(memberId);

    return ApiResponse.success(
      res,
      vouchers,
      "Lấy danh sách voucher đổi thưởng thành công",
    );
  } catch (error) {
    console.error("Get Redeemable Vouchers Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi lấy danh sách voucher đổi thưởng",
    );
  }
};

const redeemVoucherController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { voucher_id } = req.body;

    if (!voucher_id) {
      return ApiResponse.error(res, "Thiếu thông tin voucher_id", 400);
    }

    const result = await voucherService.redeemVoucher(memberId, voucher_id);

    return ApiResponse.success(
      res,
      result,
      "Đổi voucher thành công",
    );
  } catch (error) {
    console.error("Redeem Voucher Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }
    if (error.message === "VOUCHER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin voucher");
    }
    if (error.message === "VOUCHER_INACTIVE") {
      return ApiResponse.badRequest(res, "Voucher này hiện không hoạt động");
    }
    if (error.message === "VOUCHER_OUT_OF_STOCK") {
      return ApiResponse.badRequest(res, "Voucher này đã hết lượt đổi");
    }
    if (error.message === "VOUCHER_NOT_YET_VALID") {
      return ApiResponse.badRequest(res, "Voucher chưa đến thời gian áp dụng");
    }
    if (error.message === "VOUCHER_EXPIRED") {
      return ApiResponse.badRequest(res, "Voucher đã hết hạn áp dụng");
    }
    if (error.message === "TIER_NOT_ELIGIBLE") {
      return ApiResponse.badRequest(
        res,
        "Hạng thành viên của bạn chưa đủ điều kiện để đổi voucher này",
      );
    }
    if (error.message === "INSUFFICIENT_POINTS") {
      return ApiResponse.badRequest(
        res,
        "Bạn không đủ điểm tiêu dùng để đổi voucher này",
      );
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi đổi voucher",
    );
  }
};

const getOwnedVouchersController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const { status } = req.query;

    const vouchers = await voucherService.getOwnedVouchers(memberId, status);

    return ApiResponse.success(
      res,
      vouchers,
      "Lấy danh sách voucher sở hữu thành công",
    );
  } catch (error) {
    console.error("Get Owned Vouchers Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi lấy danh sách voucher sở hữu",
    );
  }
};

module.exports = {
  getRedeemableVouchersController,
  redeemVoucherController,
  getOwnedVouchersController,
};
