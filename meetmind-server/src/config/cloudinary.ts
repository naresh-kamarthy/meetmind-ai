import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

export const isCloudinaryConfigured = (): boolean =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

export const configureCloudinary = (): void => {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "[Cloudinary] Credentials not configured. Avatar uploads will be unavailable until CLOUDINARY_* env vars are set."
    );
    return;
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export { cloudinary };
