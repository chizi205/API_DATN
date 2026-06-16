const express = require("express");
const router = express.Router();
const {
  handleWebhook,
} = require("../../controllers/webhooks/payosWebhook.controller");

router.post("/payos", handleWebhook);

module.exports = router;
