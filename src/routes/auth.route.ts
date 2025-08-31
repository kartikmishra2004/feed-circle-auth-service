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
import { gatewayAuth } from "../middlewares/gatewayAuth.js";

const router = Router();

router.post("/register", authLimiter, gatewayAuth, register);
router.post("/login", authLimiter, gatewayAuth, login);
router.get("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", authLimiter, gatewayAuth, forgotPassword);
router.post("/reset-password", authLimiter, gatewayAuth, resetPassword);

// Protected routes
router.post("/logout", gatewayAuth, authenticate, logout);
router.post("/logout-all", gatewayAuth, authenticate, logoutAll);
router.get("/profile", gatewayAuth, authenticate, requireEmailVerification, getProfile);

export default router;
