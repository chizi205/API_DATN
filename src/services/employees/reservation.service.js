const reservationRepository = require("../../repositories/members/reservation.repository");
const notificationRepository = require("../../repositories/members/notification.repository");
const deviceService = require("../members/device.service");

const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

class ReservationService {
  async getReservations(employee, queryFilters) {
    const { role, branch_id: employeeBranchId } = employee;
    const { status, date, limit = 20, page = 1 } = queryFilters;

    const parsedLimit = parseInt(limit, 10) || 20;
    const parsedPage = parseInt(page, 10) || 1;
    const offset = (parsedPage - 1) * parsedLimit;

    // Filter by branch:
    // Staff/Employees can only see their own branch's reservations.
    // Admin or Manager can choose to see reservations from a specific branch (if branch_id is passed in query)
    // or see all branches if no branch_id query is passed.
    let branchId = employeeBranchId;
    if (role === "ADMIN" || role === "MANAGER") {
      if (queryFilters.branch_id) {
        branchId = parseInt(queryFilters.branch_id, 10) || null;
      } else {
        branchId = null; // Admin/Manager can see all branches if not filtered
      }
    }

    const filters = {
      branch_id: branchId,
      status,
      date,
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

  async updateReservationStatus(employee, id, status, cancelReason = null) {
    const { role, branch_id: employeeBranchId } = employee;

    // 1. Check valid status
    const allowedStatuses = ["CONFIRMED", "CANCELLED", "REJECT"];
    if (!allowedStatuses.includes(status)) {
      throw createError("Trạng thái cập nhật không hợp lệ", 400);
    }

    // 2. Find reservation
    const reservation = await reservationRepository.findById(id);
    if (!reservation) {
      throw createError("Không tìm thấy thông tin đặt bàn", 404);
    }

    // 3. Authorization check
    if (role !== "ADMIN" && role !== "MANAGER") {
      if (reservation.branch_id !== employeeBranchId) {
        throw createError("Bạn không có quyền quản lý lịch đặt của chi nhánh khác", 403);
      }
    }

    // 4. Update reservation status
    const updatedReservation = await reservationRepository.updateReservationStatus(
      id,
      status,
      cancelReason
    );

    // 5. Send notification to member
    try {
      const timeStr = formatDate(reservation.reservation_time);
      let title = "";
      let body = "";

      if (status === "CONFIRMED") {
        title = "Đã xác nhận đặt bàn thành công";
        body = `Lịch đặt lúc ${timeStr} tại ${reservation.branch_name} đã được xác nhận. Hân hạnh được đón tiếp bạn!`;
      } else if (status === "CANCELLED" || status === "REJECT") {
        const actionStr = status === "REJECT" ? "từ chối" : "hủy";
        title = `Lịch đặt bàn của bạn đã bị ${actionStr}`;
        body = `Lịch đặt lúc ${timeStr} tại ${reservation.branch_name} đã bị ${actionStr}.${cancelReason ? ` Lý do: ${cancelReason}` : ""
          }`;
      }

      // Save in-app notification in DB
      await notificationRepository.createNotification({
        member_id: reservation.member_id,
        title,
        body,
        type: "RESERVATION_STATUS",
        reference_id: id,
        reference_type: "RESERVATION",
      });

      // Send real-time FCM Push Notification
      await deviceService.sendNotificationToUser(
        reservation.member_id,
        title,
        body,
        {
          reservation_id: String(id),
          status: status,
        }
      );
    } catch (notificationError) {
      console.error("Error sending reservation status notification (non-fatal):", notificationError);
    }

    return updatedReservation;
  }
}

module.exports = new ReservationService();
