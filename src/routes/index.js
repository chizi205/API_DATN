const express = require("express");
const router = express.Router();

//member
router.use("/member", require("./members/auth.routes"));
router.use("/member", require("./members/info.routes"));
router.use("/member", require("./members/device.routes"));
router.use("/member", require("./members/voucher.routes"));
router.use("/member", require("./members/notification.routes"));
router.use("/member", require("./members/selfPayment.routes"));
router.use("/member", require("./members/reservation.routes"));

//employee
router.use("/employee", require("./employees/auth.routes"));
router.use("/employee", require("./employees/product.routes"));
router.use("/employee", require("./employees/reservation.routes"));

//admin
router.use("/admin", require("./admin/admin.routes"));

//invoice
router.use("/invoice", require("./invoices/invoices.routes"));

//paymentMethod
router.use("/paymentMethod", require("./paymentMethods/paymentMethod.routes"));

//webhook
router.use("/webhook", require("./webhooks/payos.routes"));
router.use("/webhook", require("./webhooks/mio.routes"));

//branches
router.use("/branches", require("./branches/branches.routes"));


module.exports = router;
