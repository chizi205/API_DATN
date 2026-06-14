const express = require("express");
const router = express.Router();

//member
router.use("/member", require("./members/auth.routes"));
router.use("/member", require("./members/info.routes"));
router.use("/member", require("./members/device.routes"));

//employee
router.use("/employee", require("./employees/auth.routes"));
router.use("/employee", require("./employees/product.routes"));

//invoice
router.use("/invoice", require("./invoices/invoices.routes"));

module.exports = router;
