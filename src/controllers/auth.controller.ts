import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { generateTokenPair } from "../utils/auth";
import { AppError } from "../utils/appError";
import { registerSchema, loginSchema } from "../utils/validation";
import { AuthenticatedRequest } from "../middlewares/auth";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return next(new AppError("Email already registered", 400));
    }
    const user = await User.create({
      ...validatedData,
    });
    const tokens = generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const user = await User.findOne({ email: validatedData.email }).select(
      "+password"
    );
    if (!user || !(await user.comparePassword(validatedData.password))) {
      return next(new AppError("Invalid email or password", 401));
    }
    const tokens = generateTokenPair(user);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).json({
      status: "success",
      message: "login successful.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (token: string) => token !== refreshToken
      );
      await req.user.save();
    }

    res.json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutAll(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    req.user.refreshTokens = [];
    await req.user.save();
    res.json({
      status: "success",
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    res.json({
      status: "success",
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          fullName: req.user.fullName,
          createdAt: req.user.createdAt,
          updatedAt: req.user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
