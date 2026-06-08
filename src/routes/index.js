const express = require("express");
const router = express.Router();

//member
router.use("/member", require("./members/auth.routes"));
router.use("/member", require("./members/info.routes"));
router.use("/member", require("./members/device.routes"));

module.exports = router;
