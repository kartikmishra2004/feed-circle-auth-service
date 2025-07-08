import { Router } from "express";
import {
  register,
  login,
  logout,
  logoutAll,
  getProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { authenticate, requireEmailVerification } from "../middlewares/auth.js";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// Protected routes
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/profile", authenticate, requireEmailVerification, getProfile);

export default router;
