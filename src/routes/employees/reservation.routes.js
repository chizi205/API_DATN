const express = require("express");
const router = express.Router();
const authenticateEmployee = require("../../middleware/employeeAuth.middleware");
const {
  getReservations,
  updateReservationStatus,
} = require("../../controllers/employees/reservation.controller");

router.get("/reservations", authenticateEmployee, getReservations);
router.patch("/reservations/:id/status", authenticateEmployee, updateReservationStatus);

module.exports = router;
