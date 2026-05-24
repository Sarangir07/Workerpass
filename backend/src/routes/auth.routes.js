const express = require("express");
const authController = require("../controllers/auth.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/admin/signup", authController.adminSignup);
router.post("/admin/login", authController.adminLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);
router.get("/admin-only", authenticate, authorize("admin"), (req, res) => {
  res.json({ message: "Admin route access granted" });
});

module.exports = router;
