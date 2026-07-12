const pool = require("../../config/database");
const reservationRepository = require("../../repositories/members/reservation.repository");
const { getIO } = require("../../socket");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

class ReservationService {
  async createReservation(memberId, data) {
    const { branch_id, reservation_time, guest_count, note } = data;

    // 1. Verify branch exists and is active
    const branchQuery = `
      SELECT id, name, is_active FROM branches WHERE id = $1;
    `;
    const { rows: branchRows } = await pool.query(branchQuery, [branch_id]);
    const branch = branchRows[0];

    if (!branch) {
      throw createError("Không tìm thấy chi nhánh", 404);
    }
    if (!branch.is_active) {
      throw createError("Chi nhánh hiện tại không hoạt động", 400);
    }

    // 2. Validate reservation time (must be in the future)
    const bookingTime = new Date(reservation_time);
    if (isNaN(bookingTime.getTime())) {
      throw createError("Thời gian đặt lịch không hợp lệ", 400);
    }
    if (bookingTime <= new Date()) {
      throw createError("Thời gian đặt lịch phải ở tương lai", 400);
    }

    // 3. Get member details to attach to notification
    const memberQuery = `
      SELECT full_name, phone_number FROM members WHERE id = $1;
    `;
    const { rows: memberRows } = await pool.query(memberQuery, [memberId]);
    const member = memberRows[0];

    // 4. Create reservation in database
    const reservation = await reservationRepository.createReservation({
      member_id: memberId,
      branch_id,
      reservation_time: bookingTime,
      guest_count,
      note,
    });

    // 5. Send socket notification to the branch room (for employees/staff to receive)
    try {
      const io = getIO();
      const memberName = member ? member.full_name : "Khách hàng";
      const memberPhone = member ? member.phone_number : "";
      
      io.to(`branch_${branch_id}`).emit("new_reservation", {
        message: `Có lịch đặt mới từ khách hàng ${memberName} (${memberPhone}) cho ${guest_count} người`,
        reservation: {
          ...reservation,
          member_name: memberName,
          member_phone: memberPhone,
        },
      });
    } catch (socketError) {
      console.error("Socket notification error (non-fatal):", socketError);
    }

    return reservation;
  }

  async getMemberReservations(memberId, queryFilters) {
    const { status, limit = 20, page = 1 } = queryFilters;

    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    const filters = {
      member_id: memberId,
      status,
      limit: parsedLimit,
      offset,
    };

    const [data, total] = await Promise.all([
      reservationRepository.getReservations(filters),
      reservationRepository.countReservations(filters),
    ]);

    return {
      reservations: data,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        total_pages: Math.ceil(total / parsedLimit),
      },
    };
  }

  async cancelReservation(memberId, id, cancelReason = "Khách hàng tự hủy") {
    // 1. Find reservation
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw createError("Không tìm thấy thông tin đặt bàn", 404);
    }

    // 2. Verify ownership
    if (reservation.member_id !== memberId) {
      throw createError("Bạn không có quyền hủy lịch đặt bàn này", 403);
    }

    // 3. Verify current status
    if (reservation.status === "CANCELLED" || reservation.status === "REJECT") {
      throw createError("Lịch đặt bàn này đã ở trạng thái hủy/từ chối từ trước", 400);
    }

    // 4. Update status to CANCELLED
    const updatedReservation = await reservationRepository.updateReservationStatus(
      id,
      "CANCELLED",
      cancelReason
    );

    // 5. Send Socket notification to staff
    try {
      const io = getIO();
      io.to(`branch_${reservation.branch_id}`).emit("reservation_cancelled", {
        message: `Khách hàng đã hủy lịch đặt bàn (ID: ${id})`,
        reservation_id: id,
        branch_id: reservation.branch_id,
      });
    } catch (socketError) {
      console.error("Socket notification error (non-fatal):", socketError);
    }

    return updatedReservation;
  }
}

module.exports = new ReservationService();
