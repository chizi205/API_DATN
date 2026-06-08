const { sendOTP, verifyOTP } = require("../external/twilio.service");

const memberRepository = require("../../repositories/members/auth.repositories");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

class AuthService {
  async sendOTP(phone) {
    const result = await sendOTP(phone);
    if (!result.success) {
      throw new Error(result.message || "Gửi OTP thất bại");
    }
    return {
      phone,
      status: result.status,
    };
  }

  async verifyOTP(phone, code) {
    const otpResult = await verifyOTP(phone, code);

    if (!otpResult.success || !otpResult.valid) {
      throw new Error("Mã OTP không đúng hoặc đã hết hạn");
    }

    let member = await memberRepository.findByPhone(phone);

    if (member) {
      const accessToken = createAccessToken({
        id: member.id,
        phone: member.phone_number,
        tier_id: member.tier_id,
      });

      const refreshToken = createRefreshToken({ id: member.id });

      await memberRepository.updateRefreshToken(member.id, refreshToken);

      return {
        isNewUser: false,
        access_token: accessToken,
        refresh_token: refreshToken,
        member: {
          id: member.id,
          phone_number: member.phone_number,
          full_name: member.full_name,
          current_points: member.current_points,
        },
      };
    } else {
      const defaultTierId = await memberRepository.getDefaultTier();

      if (!defaultTierId) {
        throw new Error("Chưa có hạng thành viên mặc định");
      }

      member = await memberRepository.create({
        phone_number: phone,
        full_name: null,
        tier_id: defaultTierId,
        current_points: 0,
        total_accumulated_points: 0,
      });

      const registrationToken = createAccessToken({
        member_id: member.id,
        phone: phone,
        purpose: "registration",
      });

      return {
        isNewUser: true,
        requires_registration: true,
        registration_token: registrationToken,
        phone: phone,
      };
    }
  }

  async completeRegistration(member_id, { full_name, email, date_of_birth }) {
    const updatedMember = await memberRepository.updateProfile(member_id, {
      full_name,
      email: email || null,
      date_of_birth: date_of_birth || null,
    });

    if (!updatedMember) {
      throw new Error("Không tìm thấy thành viên");
    }

    const accessToken = createAccessToken({
      id: updatedMember.id,
      phone: updatedMember.phone_number,
      tier_id: updatedMember.tier_id,
    });

    const refreshToken = createRefreshToken({
      id: updatedMember.id,
    });

    await memberRepository.updateRefreshToken(updatedMember.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      member: {
        id: updatedMember.id,
        phone_number: updatedMember.phone_number,
        full_name: updatedMember.full_name,
        current_points: updatedMember.current_points,
      },
    };
  }

  async refreshToken(refresh_token) {
    if (!refresh_token) {
      throw new Error("Thiếu refresh token");
    }

    const decoded = verifyRefreshToken(refresh_token);
    if (!decoded) {
      throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    }

    const member = await memberRepository.findByRefreshToken(refresh_token);
    if (!member) {
      throw new Error("Refresh token không hợp lệ");
    }

    const newAccessToken = createAccessToken({
      id: member.id,
      phone: member.phone_number,
      tier_id: member.tier_id,
    });

    const newRefreshToken = createRefreshToken({
      id: member.id,
    });

    await memberRepository.updateRefreshToken(member.id, newRefreshToken);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(memberId) {
    if (!memberId) {
      throw new Error("Không xác định được người dùng");
    }

    await memberRepository.clearRefreshToken(memberId);
    return true;
  }
}

module.exports = new AuthService();
