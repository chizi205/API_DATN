const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  getRedeemableVouchersController,
  redeemVoucherController,
  getOwnedVouchersController,
} = require("../../controllers/members/voucher.controller");

router.get("/vouchers/redeemable", authenticate, getRedeemableVouchersController);
router.post("/vouchers/redeem", authenticate, redeemVoucherController);
router.get("/vouchers", authenticate, getOwnedVouchersController);

module.exports = router;
