const express = require("express");
const router = express.Router();
const {
  sendOtpController,
  verifyOtpController,
  completeRegistrationController,
  refreshTokenController,
  logoutController,
} = require("../../controllers/members/auth.controller");
const sendOtpValidation = require("../../validations/sendOtp.validation");
const verifyOtpValidation = require("../../validations/verifyOtp.validation");
const completeRegistrationValidation = require("../../validations/completeRegistration.validation");
const validate = require("../../middleware/validate");
const verifyRegistrationToken = require("../../middleware/verifyRegistrationToken");
const authenticate = require("../../middleware/auth");

const { sendOtpLimiter, verifyOtpLimiter } = require("../../middleware/rateLimiter.middleware");

router.post("/send-otp", sendOtpLimiter, sendOtpValidation, validate, sendOtpController);

router.post("/verify-otp", verifyOtpLimiter, verifyOtpValidation, validate, verifyOtpController);

router.post(
  "/complete-registration",
  completeRegistrationValidation,
  validate,
  verifyRegistrationToken,
  completeRegistrationController,
);

router.post("/refresh-token", refreshTokenController);
router.post("/logout", authenticate, logoutController);
module.exports = router;
