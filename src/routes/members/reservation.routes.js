const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  createReservation,
  getReservations,
  cancelReservation,
} = require("../../controllers/members/reservation.controller");

router.post("/reservations", authenticate, createReservation);
router.get("/reservations", authenticate, getReservations);
router.patch("/reservations/:id/cancel", authenticate, cancelReservation);

module.exports = router;
