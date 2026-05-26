import { resolveDisplayAvatar } from "./avatar.js";

/**
 * Consistent user payload for API responses (login, profile, refresh).
 */
export const formatUserResponse = (user: {
  _id?: { toString(): string };
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  avatarType?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) => {
  const email = user.email;
  const name = user.name;
  const avatarType =
    user.avatarType === "upload" || user.avatarType === "url" || user.avatarType === "generated"
      ? user.avatarType
      : "generated";

  return {
    id: user._id?.toString() ?? user.id ?? "",
    _id: user._id?.toString() ?? user.id,
    name,
    email,
    role: user.role === "admin" ? "admin" : "user",
    avatar: resolveDisplayAvatar(user.avatar, email, name),
    avatarType,
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
