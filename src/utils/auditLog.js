const pool = require("../config/database");

/**
 * Ghi log hành động (phiên bản gọn)
 * @param {Object} params
 */
async function auditLog({
  actorType, // 'EMPLOYEE' | 'MEMBER' | 'SYSTEM'
  actorId,
  action, // Ví dụ: 'UPDATE_POINTS', 'APPROVE_VOUCHER'
  tableName,
  recordId,
  oldValues = null,
  newValues = null,
  description = null,
  ipAddress = null,
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs 
        (actor_type, actor_id, action, table_name, record_id, old_values, new_values, description, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        actorType,
        actorId,
        action,
        tableName,
        recordId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        description,
        ipAddress,
      ],
    );
  } catch (error) {
    console.error("Audit Log Error:", error.message);
  }
}

module.exports = auditLog;
