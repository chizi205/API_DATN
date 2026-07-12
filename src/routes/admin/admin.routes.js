const express = require("express");
const router = express.Router();

const authenticateEmployee = require("../../middleware/employeeAuth.middleware");
const authorizeRoles = require("../../middleware/role.middleware");

const AccountController = require("../../controllers/admin/account.controller");
const VoucherController = require("../../controllers/admin/voucher.controller");
const PointConfigController = require("../../controllers/admin/pointConfig.controller");
const ReportController = require("../../controllers/admin/report.controller");
const CustomerController = require("../../controllers/admin/customer.controller");
const InvoiceController = require("../../controllers/admin/invoice.controller");
const ProductController = require("../../controllers/admin/product.controller");
const CategoryController = require("../../controllers/admin/category.controller");

// Apply authentication to all admin sub-routes
router.use(authenticateEmployee);

// ==================== ACCOUNT MANAGEMENT ====================
// Only ADMIN can perform account operations
router.get("/employees", authorizeRoles("ADMIN"), AccountController.getEmployees);
router.get("/employees/:id", authorizeRoles("ADMIN"), AccountController.getEmployeeById);
router.post("/employees", authorizeRoles("ADMIN"), AccountController.createEmployee);
router.put("/employees/:id", authorizeRoles("ADMIN"), AccountController.updateEmployee);
router.delete("/employees/:id", authorizeRoles("ADMIN"), AccountController.deleteEmployee);

// ==================== VOUCHER MANAGEMENT ====================
router.get("/vouchers", authorizeRoles("ADMIN", "MANAGER"), VoucherController.getVouchers);
router.get("/vouchers/:id", authorizeRoles("ADMIN", "MANAGER"), VoucherController.getVoucherById);
router.post("/vouchers", authorizeRoles("ADMIN", "MANAGER"), VoucherController.createVoucher);
router.put("/vouchers/:id", authorizeRoles("ADMIN", "MANAGER"), VoucherController.updateVoucher);
router.delete("/vouchers/:id", authorizeRoles("ADMIN", "MANAGER"), VoucherController.deleteVoucher);

// ==================== POINT CONFIGURATIONS ====================
router.get("/point-configs", authorizeRoles("ADMIN", "MANAGER"), PointConfigController.getConfigs);
router.post("/point-configs", authorizeRoles("ADMIN", "MANAGER"), PointConfigController.createConfig);
router.put("/point-configs/:id", authorizeRoles("ADMIN", "MANAGER"), PointConfigController.updateConfig);
router.get("/tiers", authorizeRoles("ADMIN", "MANAGER"), PointConfigController.getTiers);
router.put("/tiers/:id", authorizeRoles("ADMIN", "MANAGER"), PointConfigController.updateTier);

// ==================== CUSTOMER MANAGEMENT ====================
router.get("/customers", authorizeRoles("ADMIN", "MANAGER"), CustomerController.getCustomers);
router.get("/customers/:id", authorizeRoles("ADMIN", "MANAGER"), CustomerController.getCustomerById);
router.post("/customers", authorizeRoles("ADMIN", "MANAGER"), CustomerController.createCustomer);
router.put("/customers/:id", authorizeRoles("ADMIN", "MANAGER"), CustomerController.updateCustomer);
router.delete("/customers/:id", authorizeRoles("ADMIN"), CustomerController.deleteCustomer);

// ==================== INVOICE MANAGEMENT ====================
router.get("/invoices", authorizeRoles("ADMIN", "MANAGER"), InvoiceController.getInvoices);
router.get("/invoices/:id", authorizeRoles("ADMIN", "MANAGER"), InvoiceController.getInvoiceById);
router.put("/invoices/:id/status", authorizeRoles("ADMIN"), InvoiceController.updateInvoiceStatus);

// ==================== REPORTS & STATISTICS ====================
router.get("/reports/overview", authorizeRoles("ADMIN", "MANAGER"), ReportController.getOverview);
router.get("/reports/revenue", authorizeRoles("ADMIN", "MANAGER"), ReportController.getRevenue);
router.get("/reports/monthly-revenue", authorizeRoles("ADMIN", "MANAGER"), ReportController.getMonthlyRevenue);
router.get("/reports/members", authorizeRoles("ADMIN", "MANAGER"), ReportController.getMemberStats);
router.get("/reports/top-customers", authorizeRoles("ADMIN", "MANAGER"), ReportController.getTopCustomers);
router.get("/reports/top-products", authorizeRoles("ADMIN", "MANAGER"), ReportController.getTopProducts);

// ==================== PRODUCT MANAGEMENT ====================
router.get("/products", authorizeRoles("ADMIN", "MANAGER"), ProductController.getProducts);
router.get("/products/:id", authorizeRoles("ADMIN", "MANAGER"), ProductController.getProductById);
router.post("/products", authorizeRoles("ADMIN", "MANAGER"), ProductController.createProduct);
router.put("/products/:id", authorizeRoles("ADMIN", "MANAGER"), ProductController.updateProduct);
router.delete("/products/:id", authorizeRoles("ADMIN"), ProductController.deleteProduct);

// ==================== CATEGORY MANAGEMENT ====================
router.get("/categories", authorizeRoles("ADMIN", "MANAGER"), CategoryController.getCategories);
router.get("/categories/:id", authorizeRoles("ADMIN", "MANAGER"), CategoryController.getCategoryById);
router.post("/categories", authorizeRoles("ADMIN", "MANAGER"), CategoryController.createCategory);
router.put("/categories/:id", authorizeRoles("ADMIN", "MANAGER"), CategoryController.updateCategory);
router.delete("/categories/:id", authorizeRoles("ADMIN"), CategoryController.deleteCategory);

module.exports = router;


