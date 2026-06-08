const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const updateProfileValidation = require("../../validations/updateProfile.validation");
const validate = require("../../middleware/validate");
const {
  getCardController,
  getProfileController,
  updateProfileController
} = require("../../controllers/members/info.controller");

router.get("/card", authenticate, getCardController);
router.get("/profile", authenticate, getProfileController);
router.put(
  "/profile",
  updateProfileValidation,
  validate,
  authenticate,
  updateProfileController,
);
module.exports = router;
