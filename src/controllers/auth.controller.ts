import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model.js";
import { generateTokenPair, generateRandomToken } from "../utils/auth.js";
import { AppError } from "../utils/appError.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../utils/validation.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
} from "../services/email.service.js";
import crypto from "crypto";
import { getRedisClient } from "../services/redis.service.js";

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

    const emailVerificationToken = generateRandomToken();
    user.emailVerificationToken = emailVerificationToken;

    await user.save();

    const mailData = {
      to_email: user.email,
      to_name: user.fullName,
      subject: "Email Verification for Feed Circle",
    };
    sendVerificationEmail(mailData, emailVerificationToken);

    res.status(201).json({
      status: "success",
      message: "Registeration successful, please confirm your email",
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
    const client = getRedisClient();
    const userRole = req.user.role;

    const cacheKey = `user:${req.user._id}`;
    const cachedUser = await client.get(cacheKey);

    if (cachedUser) {
      return res.json({
        status: "success",
        source: "cache",
        data: {
          user: JSON.parse(cachedUser),
        },
      });
    }

    let userData;

    if (userRole === 'individual') {
      userData = {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        role: req.user.role,
        emailVerified: req.user.emailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      };
    }

    if (userRole === 'organization') {
      userData = {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        organizationName: req.user.organizationName,
        organizationType: req.user.organizationType,
        contactPersonName: req.user.contactPersonName,
        phone: req.user.phone,
        emailVerified: req.user.emailVerified,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      };
    }

    await client.set(cacheKey, JSON.stringify(userData), {
      EX: 60 * 5,
    });

    res.json({
      status: "success",
      source: "database",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return next(new AppError("Verification token is required", 400));
    }

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return next(new AppError("Invalid or expired verification token", 400));
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    res.send(`
      <html lang="en">
          <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="stylesheet" href="style.css" />
              <title>Browser</title>
          </head>
          <body>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 8px; padding-top: 50px; padding-bottom: 50px; padding-left: 10px; padding-right: 10px;">
                  <tr>
                      <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0" width="500"
                              style="background-color: #ffffff; border-radius: 20px; padding: 30px; font-family: Arial, sans-serif;">
                              <tr>
                                  <td align="center" style="color: #222222;">
                                      <h2>Email verified</h2>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
      </html>
      `);
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const resetToken = generateRandomToken();
    user.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();

    const mailData = {
      to_email: user.email,
      to_name: user.fullName,
      subject: "Password Reset Request",
    };
    sendPasswordResetEmail(mailData, resetToken);

    res.status(200).json({
      status: "success",
      message: "Password reset email has been sent to your email address.",
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token } = req.query;
    const { password } = resetPasswordSchema.parse(req.body);
    if (!token || typeof token !== "string") {
      return next(new AppError("Verification token is required.", 400));
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      return next(
        new AppError("Invalid or expired password reset token.", 400)
      );
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    const mailData = {
      to_email: user.email,
      to_name: user.fullName,
      subject: "Password Reset Successfully.",
    };

    sendPasswordResetSuccessEmail(mailData);

    res.status(200).json({
      status: "success",
      message: "Password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
}
 