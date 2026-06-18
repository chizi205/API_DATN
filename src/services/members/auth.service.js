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

  async verifyOTP(phone, code, req) {
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

      const hashedToken = await memberRepository.hashRefreshToken(refreshToken);

      await memberRepository.createRefreshToken({
        memberId: member.id,
        tokenHash: hashedToken,
        deviceName: req?.body?.device_name || null,
        ipAddress: req?.ip,
        userAgent: req?.headers["user-agent"],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

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

  async completeRegistration(
    member_id,
    { full_name, email, date_of_birth },
    req = null,
  ) {
    const updatedMember = await memberRepository.updateProfile(member_id, {
      full_name,
      email: email || null,
      date_of_birth: date_of_birth || null,
    });

    if (!updatedMember) {
      throw new Error("Không tìm thấy thành viên");
    }

    // Tạo Access Token
    const accessToken = createAccessToken({
      id: updatedMember.id,
      phone: updatedMember.phone_number,
      tier_id: updatedMember.tier_id,
    });

    // Tạo Refresh Token mới
    const refreshToken = createRefreshToken({ id: updatedMember.id });

    // Hash refresh token
    const hashedToken = await memberRepository.hashRefreshToken(refreshToken);

    // Xóa các refresh token cũ của user (tùy chọn nhưng nên làm)
    //await memberRepository.deleteAllRefreshTokensByMemberId(updatedMember.id);

    // Lưu refresh token vào bảng mới
    await memberRepository.createRefreshToken({
      memberId: updatedMember.id,
      tokenHash: hashedToken,
      deviceName: req?.body?.device_name || null,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.["user-agent"] || null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    });

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
  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new Error("Thiếu refresh token");
    }

    // 1. Giải mã refresh token
    const decoded = verifyRefreshToken(rawRefreshToken);
    if (!decoded) {
      throw new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    }

    // 2. Tìm refresh token trong bảng mới
    const row = await memberRepository.findByRefreshToken(rawRefreshToken);
    if (!row) {
      throw new Error("Refresh token không hợp lệ");
    }

    // 3. Xóa refresh token cũ (Refresh Token Rotation - khuyến nghị)
    await memberRepository.deleteRefreshTokenByHash(row.token_hash);

    // 4. Tạo Access Token mới
    const newAccessToken = createAccessToken({
      id: row.id,
      phone: row.phone_number,
      tier_id: row.tier_id,
    });

    // 5. Tạo Refresh Token mới
    const newRefreshToken = createRefreshToken({ id: row.id });

    // 6. Hash và lưu vào bảng refresh_tokens
    const newHashedToken =
      await memberRepository.hashRefreshToken(newRefreshToken);

    await memberRepository.createRefreshToken({
      memberId: row.id,
      tokenHash: newHashedToken,
      deviceName: row.device_name,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(memberId, rawRefreshToken) {
    if (!memberId) {
      throw new Error("Không xác định được người dùng");
    }

    if (rawRefreshToken) {
      const row = await memberRepository.findByRefreshToken(rawRefreshToken);
      if (row && row.member_id === memberId) {
        await memberRepository.deleteRefreshTokenByHash(row.token_hash);
      }
    } else {
      await memberRepository.deleteAllRefreshTokensByMemberId(memberId);
    }

    return true;
  }
}

module.exports = new AuthService();
