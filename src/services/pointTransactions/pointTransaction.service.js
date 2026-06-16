const pointTransactionRepo = require("../../repositories/pointTransactions/pointTransaction.repository");

class PointTransactionService {
  /**
   * Tạo giao dịch tích điểm (EARN)
   */
  async createEarnTransaction(data) {
    return await pointTransactionRepo.createTransaction({
      member_id: data.member_id,
      transaction_type: "EARN",
      points: data.points,
      multiplier_applied: data.multiplier_applied || 1.0,
      reference_type: data.reference_type || "invoice",
      reference_id: data.reference_id,
      description: data.description || "Tích điểm từ hóa đơn",
      created_by: data.created_by,
    });
  }

  /**
   * Tạo giao dịch đổi điểm (REDEEM)
   */
  async createRedeemTransaction(data) {
    return await pointTransactionRepo.createTransaction({
      member_id: data.member_id,
      transaction_type: "REDEEM",
      points: -Math.abs(data.points), // Lưu dưới dạng âm
      multiplier_applied: 1.0,
      reference_type: data.reference_type || "voucher",
      reference_id: data.reference_id,
      description: data.description || "Đổi voucher",
      created_by: data.created_by,
    });
  }

  /**
   * Lấy lịch sử điểm của thành viên
   */
  async getMemberPointHistory(memberId, pagination) {
    return await pointTransactionRepo.getTransactionsByMemberId(
      memberId,
      pagination,
    );
  }

  /**
   * Lấy chi tiết một giao dịch
   */
  async getTransactionById(id) {
    return await pointTransactionRepo.findById(id);
  }
}

module.exports = new PointTransactionService();
