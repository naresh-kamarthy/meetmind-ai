import jwt from "jsonwebtoken";
import { Response } from "express";
import { env } from "../config/env.js";

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;

const cookieBaseOptions = () => {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax" | "strict",
    path: "/",
  };
};

export const generateTokens = (id: string, role: string) => {
  const accessToken = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id, role }, JWT_REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const base = cookieBaseOptions();

  res.cookie("accessToken", accessToken, {
    ...base,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...base,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearTokenCookies = (res: Response) => {
  const base = cookieBaseOptions();
  res.clearCookie("accessToken", base);
  res.clearCookie("refreshToken", base);
};
