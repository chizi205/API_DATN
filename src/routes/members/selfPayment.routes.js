const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  previewPayment,
  checkoutPayment,
} = require("../../controllers/members/selfPayment.controller");

router.get("/self-payment/preview", authenticate, previewPayment);
router.post("/self-payment/checkout", authenticate, checkoutPayment);

module.exports = router;
