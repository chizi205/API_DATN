// routes/device.routes.js
const express = require("express");
const router = express.Router();
const {
  registerDeviceController,
} = require("../../controllers/members/device.controller");
const authMiddleware = require("../../middleware/auth");

router.post("/register", authMiddleware, registerDeviceController);

module.exports = router;
