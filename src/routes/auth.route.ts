import { Router } from "express";
import {
  register,
  login,
  logout,
  logoutAll,
  getProfile,
} from "../controllers/auth.controller";
import { authLimiter } from "../middlewares/rateLimiter";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Protected routes
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAll);
router.get("/profile", authenticate, getProfile);

export default router;
