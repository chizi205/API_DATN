const reservationService = require("../../services/members/reservation.service");
const ApiResponse = require("../../utils/response");

class ReservationController {
  async createReservation(req, res) {
    try {
      const { branch_id, reservation_time, guest_count, note } = req.body;
      const memberId = req.user.id;

      if (!branch_id) {
        return ApiResponse.error(res, "Thiếu thông tin chi nhánh (branch_id)", 400);
      }
      if (!reservation_time) {
        return ApiResponse.error(res, "Thiếu thời gian đặt lịch (reservation_time)", 400);
      }
      if (!guest_count) {
        return ApiResponse.error(res, "Thiếu số lượng khách (guest_count)", 400);
      }

      const parsedGuestCount = parseInt(guest_count, 10);
      if (isNaN(parsedGuestCount) || parsedGuestCount <= 0) {
        return ApiResponse.error(res, "Số lượng khách phải là một số nguyên lớn hơn 0", 400);
      }

      const result = await reservationService.createReservation(memberId, {
        branch_id: parseInt(branch_id, 10),
        reservation_time,
        guest_count: parsedGuestCount,
        note,
      });

      return ApiResponse.success(res, result, "Tạo lịch đặt bàn thành công", 201);
    } catch (error) {
      console.error("[Create Reservation Error]", error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  async getReservations(req, res, next) {
    try {
      const memberId = req.user.id;
      const queryFilters = {
        status: req.query.status,
        limit: req.query.limit,
        page: req.query.page,
      };

      const result = await reservationService.getMemberReservations(memberId, queryFilters);

      return ApiResponse.success(
        res,
        result,
        "Lấy danh sách đặt bàn thành công"
      );
    } catch (error) {
      console.error("[Member Get Reservations Error]", error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }

  async cancelReservation(req, res, next) {
    try {
      const memberId = req.user.id;
      const { id } = req.params;
      const { cancel_reason } = req.body;

      const result = await reservationService.cancelReservation(
        memberId,
        parseInt(id, 10),
        cancel_reason || undefined
      );

      return ApiResponse.success(
        res,
        result,
        "Hủy lịch đặt bàn thành công"
      );
    } catch (error) {
      console.error("[Member Cancel Reservation Error]", error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new ReservationController();
