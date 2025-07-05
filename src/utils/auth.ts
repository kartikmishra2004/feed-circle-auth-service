import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import crypto from "crypto";

export interface TokenPayload {
  id: string;
  email: string;
  type: "access" | "refresh";
  fbPageId?: string;
  igBusinessAccountId?: string;
}

export const generateAccessToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "access",
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: "30d",
    }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const generateTokenPair = (user: IUser) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
