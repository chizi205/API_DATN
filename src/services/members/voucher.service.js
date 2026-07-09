const voucherRepository = require("../../repositories/members/voucher.repository");

class VoucherService {
  async getRedeemableVouchers(memberId) {
    const member = await voucherRepository.getMemberWithTier(memberId);
    if (!member) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    const [tiers, vouchers] = await Promise.all([
      voucherRepository.getAllMembershipTiers(),
      voucherRepository.getAllActiveVouchers(),
    ]);

    const memberTierId = member.tier_id ? Number(member.tier_id) : null;
    const memberPoints = member.current_points || 0;
    const memberAccumulatedPoints = member.total_accumulated_points || 0;

    return vouchers.map((voucher) => {
      const applicableTiers = (voucher.applicable_tiers || []).map(Number);
      const hasTierLimit = applicableTiers.length > 0;

      const isTierEligible = !hasTierLimit || (memberTierId !== null && applicableTiers.includes(memberTierId));
      const hasEnoughPoints = memberPoints >= (voucher.point_cost || 0);
      const canRedeem = isTierEligible && hasEnoughPoints;

      let requiredTier = null;
      let pointsNeededToUpgrade = 0;

      if (!isTierEligible && hasTierLimit) {

        const qualifyingTiers = tiers.filter((t) => applicableTiers.includes(Number(t.id)));

        if (qualifyingTiers.length > 0) {
          qualifyingTiers.sort((a, b) => a.min_points - b.min_points);
          const reqTier = qualifyingTiers[0];
          requiredTier = {
            id: reqTier.id,
            tier_name: reqTier.tier_name,
            min_points: reqTier.min_points,
            color_code: reqTier.color_code,
          };
          pointsNeededToUpgrade = Math.max(0, reqTier.min_points - memberAccumulatedPoints);
        }
      }

      const applicableTiersInfo = applicableTiers.map((tierId) => {
        const tier = tiers.find((t) => Number(t.id) === tierId);
        return {
          id: tierId,
          tier_name: tier ? tier.tier_name : "Unknown",
        };
      });

      return {
        id: voucher.id,
        code: voucher.code,
        title: voucher.title,
        discount_type: voucher.discount_type,
        discount_value: parseFloat(voucher.discount_value),
        max_discount: voucher.max_discount ? parseFloat(voucher.max_discount) : null,
        point_cost: voucher.point_cost,
        stock_quantity: voucher.stock_quantity,
        applicable_tiers: applicableTiersInfo,
        valid_from: voucher.valid_from,
        valid_to: voucher.valid_to,
        expiry_days: voucher.expiry_days,

        is_tier_eligible: isTierEligible,
        has_enough_points: hasEnoughPoints,
        can_redeem: canRedeem,

        required_tier: requiredTier,
        points_needed_to_upgrade: pointsNeededToUpgrade,
        points_needed_to_redeem: Math.max(0, (voucher.point_cost || 0) - memberPoints),
      };
    });
  }

  async redeemVoucher(memberId, voucherId) {
    const crypto = require("crypto");

    // 1. Fetch member details
    const member = await voucherRepository.getMemberWithTier(memberId);
    if (!member) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    // 2. Fetch voucher details
    const voucher = await voucherRepository.getVoucherById(voucherId);
    if (!voucher) {
      throw new Error("VOUCHER_NOT_FOUND");
    }

    // 3. Validate voucher status
    if (!voucher.is_active) {
      throw new Error("VOUCHER_INACTIVE");
    }

    if ((voucher.stock_quantity || 0) <= 0) {
      throw new Error("VOUCHER_OUT_OF_STOCK");
    }

    const now = new Date();
    if (voucher.valid_from && new Date(voucher.valid_from) > now) {
      throw new Error("VOUCHER_NOT_YET_VALID");
    }
    if (voucher.valid_to && new Date(voucher.valid_to) < now) {
      throw new Error("VOUCHER_EXPIRED");
    }

    // 4. Validate tier eligibility
    const applicableTiers = (voucher.applicable_tiers || []).map(Number);
    const memberTierId = member.tier_id ? Number(member.tier_id) : null;
    const hasTierLimit = applicableTiers.length > 0;
    
    if (hasTierLimit && (!memberTierId || !applicableTiers.includes(memberTierId))) {
      throw new Error("TIER_NOT_ELIGIBLE");
    }

    // 5. Validate points balance
    const memberPoints = member.current_points || 0;
    if (memberPoints < (voucher.point_cost || 0)) {
      throw new Error("INSUFFICIENT_POINTS");
    }

    // 6. Calculate expiry date and generate unique code
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (voucher.expiry_days || 30));

    const uniqueSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const voucherCode = `${voucher.code}-${uniqueSuffix}`;

    // 7. Perform db transaction
    const { memberVoucher, newPoints } = await voucherRepository.redeemVoucherTransaction(
      memberId,
      voucher.id,
      voucher.point_cost,
      expiryDate,
      voucherCode
    );

    return {
      member_voucher_id: memberVoucher.id,
      voucher_code: memberVoucher.voucher_code,
      expiry_date: memberVoucher.expiry_date,
      points_spent: memberVoucher.points_spent,
      remaining_points: newPoints,
      status: memberVoucher.status,
    };
  }

  async getOwnedVouchers(memberId, status = null) {
    const member = await voucherRepository.getMemberWithTier(memberId);
    if (!member) {
      throw new Error("MEMBER_NOT_FOUND");
    }

    const vouchers = await voucherRepository.getMemberVouchers(memberId, status);
    
    return vouchers.map(v => ({
      ...v,
      discount_value: parseFloat(v.discount_value),
      max_discount: v.max_discount ? parseFloat(v.max_discount) : null,
    }));
  }
}

module.exports = new VoucherService();
