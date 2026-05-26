import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadAvatar,
  setAvatarUrl,
  removeAvatar,
} from "../controllers/avatarController.js";
import {
  avatarUploadMiddleware,
  assertCloudinaryReady,
} from "../middleware/uploadMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { avatarUrlSchema } from "../validators/avatarValidator.js";

const router = Router();

router.use(protect);

router.post(
  "/avatar/upload",
  assertCloudinaryReady,
  avatarUploadMiddleware,
  uploadAvatar
);

router.post("/avatar/url", validate(avatarUrlSchema), setAvatarUrl);
router.delete("/avatar", removeAvatar);

export default router;
