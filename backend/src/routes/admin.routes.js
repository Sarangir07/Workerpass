const express = require("express");
const adminController = require("../controllers/admin.controller");
const isAdmin = require("../middlewares/isAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// Admin route flow: verify JWT once, then require an admin role for every endpoint below.
router.use(verifyToken, isAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/users", adminController.getUsers);
router.get("/workers", adminController.getWorkers);
router.get("/employers", adminController.getEmployers);
router.get("/jobs", adminController.getJobs);
router.get("/verifications", adminController.getVerifications);
router.get("/reports", adminController.getReports);
router.get("/analytics", adminController.getAnalytics);
router.get("/settings", adminController.getSettings);

module.exports = router;
