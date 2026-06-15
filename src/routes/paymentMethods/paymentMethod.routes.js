const express = require("express");
const router = express.Router();
const paymentMethodController = require("../../controllers/paymentMethods/paymentMethod.controller");
const authenticateEmployee = require("../../middleware/employeeAuth.middleware");

router.get("/", authenticateEmployee, paymentMethodController.getAllActive);

//admin
router.get("/all", paymentMethodController.getAll);

module.exports = router;
