const express = require("express");
const router = express.Router();

const {
  getAllProductsController,
  getProductByIdController,
  getAllCategoriesController,
  getCategoryByIdController,
} = require("../../controllers/employees/product.controller");

const authenticateEmployee = require("../../middleware/employeeAuth.middleware");

router.get("/products", authenticateEmployee, getAllProductsController);

router.get("/products/:id", authenticateEmployee, getProductByIdController);

router.get("/categories", authenticateEmployee, getAllCategoriesController);

router.get("/categories/:id", authenticateEmployee, getCategoryByIdController);

module.exports = router;
