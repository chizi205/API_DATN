const express = require("express");
const router = express.Router();
const {
  handleWebhook,
} = require("../../controllers/webhooks/mioWebhook.controller");

router.post("/mio", handleWebhook);



module.exports = router;
