import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { generateTokens, setTokenCookies, clearTokenCookies } from "../utils/token.js";
import { formatUserResponse } from "../utils/userResponse.js";
import { getGeneratedAvatarUrl } from "../utils/avatar.js";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const user = new User({
      name,
      email,
      password,
      avatar: getGeneratedAvatarUrl(email, name),
      avatarType: "generated",
    });
    await user.save();

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);
    setTokenCookies(res, accessToken, newRefreshToken);

    return res.status(201).json({
      message: "User registered successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact support." });
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);
    setTokenCookies(res, accessToken, newRefreshToken);

    return res.json({
      message: "Logged in successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    clearTokenCookies(res);
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh = req.cookies?.refreshToken;
    if (!refresh) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refresh, JWT_REFRESH_SECRET);
    } catch (err) {
      clearTokenCookies(res);
      return res.status(401).json({ message: "Refresh token invalid or expired" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isActive === false) {
      clearTokenCookies(res);
      return res.status(403).json({ message: "Your account has been deactivated." });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.role
    );
    setTokenCookies(res, newAccessToken, newRefreshToken);

    return res.json({
      message: "Tokens refreshed successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(formatUserResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) user.name = name;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
