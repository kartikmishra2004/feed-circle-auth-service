import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let err = { ...error };
  err.message = error.message;

  // Zod validation errors
  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(", ");
    err = new AppError(message, 400);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const message = "Duplicate field value entered";
    err = new AppError(message, 400);
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const message = Object.values(error.errors).map((val: any) => val.message);
    err = new AppError(message.join(", "), 400);
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    const message = "Invalid token";
    err = new AppError(message, 401);
  }

  if (error.name === "TokenExpiredError") {
    const message = "Token expired";
    err = new AppError(message, 401);
  }

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
