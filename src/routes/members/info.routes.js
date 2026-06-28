const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const updateProfileValidation = require("../../validations/updateProfile.validation");
const sendOtpValidation = require("../../validations/sendOtp.validation");
const validate = require("../../middleware/validate");
const {
  getCardController,
  getProfileController,
  updateProfileController,
  getMemberByPhone,
  getInvoicesHistoryController,
  getPointHistoryController,
} = require("../../controllers/members/info.controller");
const authenticateEmployee = require("../../middleware/employeeAuth.middleware");
router.get("/card", authenticate, getCardController);
router.get("/profile", authenticate, getProfileController);
router.put(
  "/profile",
  updateProfileValidation,
  validate,
  authenticate,
  updateProfileController,
);
router.get("/phone", authenticateEmployee, getMemberByPhone);
router.get("/invoices", authenticate, getInvoicesHistoryController);
router.get("/point-history", authenticate, getPointHistoryController);
module.exports = router;
