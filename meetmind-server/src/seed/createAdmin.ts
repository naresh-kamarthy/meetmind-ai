import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { getGeneratedAvatarUrl } from "../utils/avatar.js";

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate strong password requirements
const isStrongPassword = (password: string): { valid: boolean; reason?: string } => {
  if (password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one digit." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one special character." };
  }
  return { valid: true };
};

/**
 * Checks for the presence of the system administrator user and creates one if missing.
 * Runs startup database validations, admin configuration schema validations, and strong password checks.
 */
export const createAdminUser = async (): Promise<void> => {
  // 1. Startup validation (Mongoose connection must be active)
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database connection is not active. Cannot seed admin user.");
  }

  const adminEmail = env.ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD;

  // 2. Admin credentials validation
  if (!adminEmail || !adminEmail.trim()) {
    throw new Error("Admin email is required and cannot be empty.");
  }
  if (!isValidEmail(adminEmail)) {
    throw new Error(`Invalid admin email format configured: "${adminEmail}"`);
  }
  if (!adminPassword || !adminPassword.trim()) {
    throw new Error("Admin password is required and cannot be empty.");
  }

  // 3. Strong password validation
  const pwdValidation = isStrongPassword(adminPassword);
  if (!pwdValidation.valid) {
    throw new Error(`Insecure admin password configured: ${pwdValidation.reason}`);
  }

  try {
    // Check if admin email already exists in the system
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✅ Existing account promoted to admin role");
      } else {
        console.log("ℹ️ Admin user already exists");
      }
      return;
    }

    // Hash the password securely using bcrypt with a work factor of 10
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the admin user. We use insertMany here to bypass the Mongoose model's pre('save') hook,
    // which otherwise would double-hash the password. This correctly writes a single-hashed secure password
    // while strictly utilizing the Mongoose model.
    await User.insertMany([{
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      avatar: getGeneratedAvatarUrl(adminEmail, "System Admin"),
      avatarType: "generated",
      avatarPublicId: "",
    }]);

    console.log("✅ Admin user created successfully");
  } catch (error: any) {
    console.error("❌ Failed to create admin user during seeding:", error.message);
    throw error;
  }
};
