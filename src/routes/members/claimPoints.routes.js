const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const {
  previewPoints,
  claimPoints,
} = require("../../controllers/members/claimPoints.controller");

router.get("/claim-points/preview", authenticate, previewPoints);
router.post("/claim-points", authenticate, claimPoints);

module.exports = router;
