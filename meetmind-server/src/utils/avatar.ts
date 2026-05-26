import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

export type AvatarType = "upload" | "url" | "generated";

export const AVATAR_FOLDER = "meetmind-avatars";

export const getGeneratedAvatarUrl = (email: string, name?: string): string => {
  const seed = encodeURIComponent(name?.trim() || email);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=6366f1,8b5cf6`;
};

export const resolveDisplayAvatar = (
  avatar: string | undefined,
  email: string,
  name?: string
): string => {
  if (avatar && avatar.trim()) return avatar.trim();
  return getGeneratedAvatarUrl(email, name);
};

export const deleteCloudinaryAsset = async (publicId?: string | null): Promise<void> => {
  if (!publicId || !isCloudinaryConfigured()) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("[Cloudinary] Failed to delete asset:", publicId, error);
  }
};

export const isAllowedAvatarUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0"];
    if (blockedHosts.includes(parsed.hostname)) return false;
    return true;
  } catch {
    return false;
  }
};
