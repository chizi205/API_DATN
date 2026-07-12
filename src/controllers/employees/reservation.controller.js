const reservationService = require("../../services/employees/reservation.service");
const ApiResponse = require("../../utils/response");

class ReservationController {
  async getReservations(req, res, next) {
    try {
      const employee = req.employee;
      const queryFilters = {
        branch_id: req.query.branch_id,
        status: req.query.status,
        date: req.query.date,
        limit: req.query.limit,
        page: req.query.page,
      };

      const result = await reservationService.getReservations(employee, queryFilters);

      return ApiResponse.success(
        res,
        result,
        "Lấy danh sách đặt bàn thành công"
      );
    } catch (error) {
      console.error("[Employee Get Reservations Error]", error);
      next(error);
    }
  }

  async updateReservationStatus(req, res, next) {
    try {
      const employee = req.employee;
      const { id } = req.params;
      const { status, cancel_reason } = req.body;

      if (!status) {
        return ApiResponse.error(res, "Thiếu trạng thái đặt bàn (status)", 400);
      }

      const result = await reservationService.updateReservationStatus(
        employee,
        parseInt(id, 10),
        status,
        cancel_reason || null
      );

      return ApiResponse.success(
        res,
        result,
        "Cập nhật trạng thái lịch đặt bàn thành công"
      );
    } catch (error) {
      console.error("[Employee Update Reservation Status Error]", error);
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, error.message, statusCode);
    }
  }
}

module.exports = new ReservationController();
