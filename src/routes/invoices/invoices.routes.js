const express = require("express");
const router = express.Router();
const {
  createDraftInvoiceValidation,
} = require("../../validations/createInvoice.validator");
const validate = require("../../middleware/validate");
const authenticateEmployee = require("../../middleware/employeeAuth.middleware");
const {
  createDraftInvoice,
  checkoutInvoice,
  linkMemberToInvoice,
  cancelDraft,
  getMyInvoicesToday,
  findInvoiceById,
} = require("../../controllers/invoices/invoice.controller");
router.post(
  "/draft",
  authenticateEmployee,
  createDraftInvoiceValidation,
  validate,
  createDraftInvoice,
);
router.post("/:id/checkout", authenticateEmployee, checkoutInvoice);
router.patch(
  "/:invoiceId/link-member",
  authenticateEmployee,
  linkMemberToInvoice,
);
router.post("/:id/cancel", authenticateEmployee, cancelDraft);
router.get("/my/today", authenticateEmployee, getMyInvoicesToday);
router.get("/:id", authenticateEmployee, findInvoiceById);
module.exports = router;
