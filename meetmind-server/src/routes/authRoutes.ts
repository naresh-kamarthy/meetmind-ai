import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../validators/authValidator.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", authLimiter, refreshToken);
router.post("/reset-password", authLimiter, (_req, res) => {
  res.status(501).json({
    success: false,
    message: "Password reset is not yet implemented. Please contact support.",
  });
});

router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

export default router;
