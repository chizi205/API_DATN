const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/auth");
const notificationController = require("../../controllers/members/notification.controller");

router.get("/notifications", authenticate, notificationController.getNotifications);
router.patch("/notifications/:id/read", authenticate, notificationController.markAsRead);
router.patch("/notifications/read-all", authenticate, notificationController.markAllAsRead);

module.exports = router;
