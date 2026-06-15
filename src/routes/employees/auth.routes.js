const express = require("express");
const router = express.Router();
const {
  loginController,
  logoutController,
} = require("../../controllers/employees/auth.controller");
const authenticateEmployee = require("../../middleware/employeeAuth.middleware");
router.post("/login", loginController);
router.post("/logout", authenticateEmployee, logoutController);
module.exports = router;
