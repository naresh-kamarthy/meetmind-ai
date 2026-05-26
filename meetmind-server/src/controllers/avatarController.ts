import { Response, NextFunction } from "express";
import { User } from "../models/User.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { formatUserResponse } from "../utils/userResponse.js";
import {
  deleteCloudinaryAsset,
  getGeneratedAvatarUrl,
  isAllowedAvatarUrl,
} from "../utils/avatar.js";
import { broadcastAvatarUpdate } from "../socket/index.js";

const cleanupPreviousUpload = async (user: InstanceType<typeof User>) => {
  if (user.avatarType === "upload" && user.avatarPublicId) {
    await deleteCloudinaryAsset(user.avatarPublicId);
  }
};

const emitAvatarSync = (user: InstanceType<typeof User>) => {
  const formatted = formatUserResponse(user);
  broadcastAvatarUpdate({
    userId: formatted.id,
    avatar: formatted.avatar,
    avatarType: formatted.avatarType ?? "generated",
    name: formatted.name,
    email: formatted.email,
  });
};

export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const file = req.file as Express.Multer.File & { path?: string; filename?: string };
    if (!file?.path) {
      return res.status(400).json({ success: false, message: "No valid image file provided." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await cleanupPreviousUpload(user);

    const publicId =
      (file as Express.Multer.File & { filename?: string }).filename ||
      (file as { public_id?: string }).public_id ||
      undefined;

    user.avatar = file.path;
    user.avatarPublicId = publicId ?? "";
    user.avatarType = "upload";
    await user.save();

    emitAvatarSync(user);

    return res.json({
      success: true,
      message: "Avatar uploaded successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const setAvatarUrl = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const { url } = req.body as { url?: string };
    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, message: "Avatar URL is required." });
    }

    if (!isAllowedAvatarUrl(url)) {
      return res.status(400).json({ success: false, message: "Invalid or unsafe avatar URL." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await cleanupPreviousUpload(user);

    user.avatar = url.trim();
    user.avatarPublicId = "";
    user.avatarType = "url";
    await user.save();

    emitAvatarSync(user);

    return res.json({
      success: true,
      message: "Avatar URL updated successfully",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

export const removeAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await cleanupPreviousUpload(user);

    user.avatar = getGeneratedAvatarUrl(user.email, user.name);
    user.avatarPublicId = "";
    user.avatarType = "generated";
    await user.save();

    emitAvatarSync(user);

    return res.json({
      success: true,
      message: "Avatar removed. Using generated avatar.",
      user: formatUserResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
