import { Router } from "express";
import {
  register,
  login,
  logout,
  logoutAll,
  getProfile,
  verifyEmail,
} from "../controllers/auth.controller";
import {
  authLimiter,
  emailVerificationLimiter,
} from "../middlewares/rateLimiter";
import { authenticate, requireEmailVerification } from "../middlewares/auth";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/verify-email", emailVerificationLimiter, verifyEmail);

// Protected routes
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/profile", authenticate, requireEmailVerification, getProfile);

export default router;
