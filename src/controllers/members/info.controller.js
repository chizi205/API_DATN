const memberService = require("../../services/members/info.service");
const ApiResponse = require("../../utils/response");

const getCardController = async (req, res) => {
  try {
    const memberId = req.user.id;

    const profile = await memberService.getCard(memberId);

    return ApiResponse.success(
      res,
      profile,
      "Lấy thông tin thành viên thành công",
    );
  } catch (error) {
    console.error("Get Profile Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi lấy thông tin thành viên",
    );
  }
};

const getProfileController = async (req, res) => {
  try {
    const memberId = req.user.id;

    const profile = await memberService.getProfile(memberId);

    return ApiResponse.success(
      res,
      profile,
      "Lấy thông tin thành viên thành công",
    );
  } catch (error) {
    console.error("Get Profile Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi lấy thông tin thành viên",
    );
  }
};
const updateProfileController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const updateData = req.body;

    const updatedProfile = await memberService.updateProfile(
      memberId,
      updateData,
    );

    return ApiResponse.success(
      res,
      updatedProfile,
      "Cập nhật thông tin thành công",
    );
  } catch (error) {
    console.error("Update Profile Controller Error:", error);

    if (error.message === "MEMBER_NOT_FOUND") {
      return ApiResponse.notFound(res, "Không tìm thấy thông tin thành viên");
    }

    if (error.message === "INVALID_GENDER") {
      return ApiResponse.badRequest(
        res,
        "Giá trị giới tính không hợp lệ (MALE, FEMALE, OTHER, UNKNOWN)",
      );
    }

    return ApiResponse.serverError(
      res,
      "Lỗi server khi cập nhật thông tin thành viên",
    );
  }
};
const getMemberByPhone = async (req, res) => {
  try {
    const phone = req.query.phone;
    if (!phone || typeof phone !== "string" || phone.trim().length < 9) {
      return ApiResponse.error(res, "Số điện thoại không hợp lệ", 400);
    }

    const member = await memberService.getMemberByPhone(phone);

    return ApiResponse.success(res, member, "Tìm thành viên thành công");
  } catch (error) {
    console.error("[Get Member By Phone Error]", error);
    const statusCode = error.message.includes("Không tìm thấy") ? 404 : 400;
    return ApiResponse.error(res, error.message, statusCode);
  }
};
module.exports = {
  getCardController,
  getProfileController,
  updateProfileController,
  getMemberByPhone,
};
