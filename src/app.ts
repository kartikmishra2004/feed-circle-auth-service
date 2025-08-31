import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { generalLimiter } from "./middlewares/rateLimiter.js";
import connectDB from "./config/db.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.route.js";
import { API_BASE } from "./config/constants.js";
import { connectRedis } from "./services/redis.service.js";

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(cors());
app.use(generalLimiter);
app.use(compression());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Redis connection for caching
(async () => {
  await connectRedis();
})();

// Logging
app.use(morgan("dev"));

// Routes
app.use(`${API_BASE}/auth`, authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Global error handler
app.use(globalErrorHandler);

// Connect to the database
connectDB();

export default app;
