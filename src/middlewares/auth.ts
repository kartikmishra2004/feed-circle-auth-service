import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth";
import { User } from "../models/user.model";
import { AppError } from "../utils/appError";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access token is required", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    if (decoded.type !== "access") {
      return next(new AppError("Invalid token type", 401));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    next(error);
  }
};

export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user.emailVerified) {
    return next(new AppError("Email verification required", 403));
  }
  next();
};
