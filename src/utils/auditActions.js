const auditLog = require("./auditLog");

const Audit = {
  // ==================== ĐIỂM & HẠNG THÀNH VIÊN ====================
  
  /** Nhân viên cộng/trừ điểm cho khách hàng */
  memberPointsChanged: (memberId, employeeId, oldPoints, newPoints, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "UPDATE_POINTS",
      tableName: "members",
      recordId: memberId,
      oldValues: { current_points: oldPoints },
      newValues: { current_points: newPoints },
      description,
    }),

  /** Thay đổi hạng thành viên của khách hàng */
  memberTierChanged: (memberId, employeeId, oldTierId, newTierId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "CHANGE_TIER",
      tableName: "members",
      recordId: memberId,
      oldValues: { tier_id: oldTierId },
      newValues: { tier_id: newTierId },
      description,
    }),

  // ==================== VOUCHER ====================

  /** Duyệt voucher */
  voucherApproved: (voucherId, employeeId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "APPROVE_VOUCHER",
      tableName: "vouchers",
      recordId: voucherId,
      oldValues: { status: "PENDING" },
      newValues: { status: "APPROVED" },
      description,
    }),

  /** Từ chối voucher */
  voucherRejected: (voucherId, employeeId, reason = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "REJECT_VOUCHER",
      tableName: "vouchers",
      recordId: voucherId,
      oldValues: { status: "PENDING" },
      newValues: { status: "REJECTED" },
      description: reason,
    }),

  /** Hủy voucher */
  voucherCancelled: (voucherId, employeeId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "CANCEL_VOUCHER",
      tableName: "vouchers",
      recordId: voucherId,
      description,
    }),

  // ==================== HÓA ĐƠN & GIAO DỊCH ====================

  /** Tạo hóa đơn / giao dịch */
  invoiceCreated: (invoiceId, employeeId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "CREATE_INVOICE",
      tableName: "invoices",
      recordId: invoiceId,
      description,
    }),

  /** Sửa hóa đơn */
  invoiceUpdated: (invoiceId, employeeId, oldData, newData, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "UPDATE_INVOICE",
      tableName: "invoices",
      recordId: invoiceId,
      oldValues: oldData,
      newValues: newData,
      description,
    }),

  /** Xóa hóa đơn */
  invoiceDeleted: (invoiceId, employeeId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "DELETE_INVOICE",
      tableName: "invoices",
      recordId: invoiceId,
      description,
    }),

  // ==================== THAY ĐỔI THÔNG TIN ====================

  /** Cập nhật thông tin khách hàng */
  memberUpdated: (memberId, employeeId, oldData, newData, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "UPDATE_MEMBER",
      tableName: "members",
      recordId: memberId,
      oldValues: oldData,
      newValues: newData,
      description,
    }),

  /** Cập nhật thông tin nhân viên */
  employeeUpdated: (employeeId, updatedBy, oldData, newData, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: updatedBy,
      action: "UPDATE_EMPLOYEE",
      tableName: "employees",
      recordId: employeeId,
      oldValues: oldData,
      newValues: newData,
      description,
    }),

  // ==================== XÓA DỮ LIỆU ====================

  /** Xóa dữ liệu chung (dùng khi không có action cụ thể) */
  dataDeleted: (tableName, recordId, employeeId, description = null) =>
    auditLog({
      actorType: "EMPLOYEE",
      actorId: employeeId,
      action: "DELETE",
      tableName,
      recordId,
      description,
    }),
};

module.exports = Audit;