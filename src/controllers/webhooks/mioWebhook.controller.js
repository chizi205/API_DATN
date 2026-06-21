const invoiceService = require("../../services/invoices/invoice.service");
const memberRepo = require("../../repositories/members/info.repositories");
const pointTransactionRepo = require("../../repositories/pointTransactions/pointTransaction.repository");
const deviceService = require("../../services/members/device.service");
const { getIO } = require("../../socket");
const ApiResponse = require("../../utils/response");
const pool = require("../../config/database");

class mioWebhookController {
  async handleWebhook(req, res) {
    const webhookPayload = req.body;
    console.log(webhookPayload);
  }
}

module.exports = new mioWebhookController();
