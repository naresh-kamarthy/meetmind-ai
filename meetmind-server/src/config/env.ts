import "dotenv/config";

const REQUIRED_ENV_VARS = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GEMINI_API_KEY",
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("================================================================================");
  console.error("FATAL STARTUP ERROR: Production-critical environment variables are missing!");
  console.error("Please configure the following keys in your .env file or environment:");
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error("================================================================================");
  process.exit(1);
}

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@meetmind.ai",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
};
