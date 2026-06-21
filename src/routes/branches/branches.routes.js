const express = require("express");
const router = express.Router();

const branchesController = require("../../controllers/branches/branches.controller");
const authenticate = require("../../middleware/auth");
router.get("/", authenticate, branchesController.getAllStores);

module.exports = router;
