import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { AVATAR_FOLDER } from "../utils/avatar.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new Error("Only JPG, JPEG, PNG, and WebP images are allowed."));
    return;
  }
  cb(null, true);
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter,
});

const buildCloudinaryUpload = () => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req: Request, file: Express.Multer.File) => ({
      folder: AVATAR_FOLDER,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `user-${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "auto" }],
    }),
  });

  return multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
    fileFilter,
  });
};

export const avatarUploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Avatar upload is not configured. Please set Cloudinary environment variables.",
    });
  }

  return buildCloudinaryUpload().single("avatar")(req, res, next);
};

/** Fallback guard when Cloudinary is unavailable — rejects before processing. */
export const assertCloudinaryReady = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isCloudinaryConfigured()) {
    return res.status(503).json({
      success: false,
      message: "Avatar upload service is temporarily unavailable.",
    });
  }
  next();
};

export const handleMulterError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image must be 2MB or smaller.",
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.message?.includes("Only JPG")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

export { memoryUpload };
