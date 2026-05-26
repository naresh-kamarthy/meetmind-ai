import { Router } from "express";
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  generateMeetingSummary,
  generateMeetingEmail,
  generateMeetingTasks,
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createMeetingSchema, updateMeetingSchema } from "../validators/meetingValidator.js";
import { aiLimiter } from "../middleware/rateLimiters.js";

const router = Router();

router.use(protect);

router.post("/", validate(createMeetingSchema), createMeeting);
router.get("/", getMeetings);
router.get("/:id", getMeetingById);
router.put("/:id", validate(updateMeetingSchema), updateMeeting);
router.delete("/:id", deleteMeeting);

router.post("/:id/summary", aiLimiter, generateMeetingSummary);
router.post("/:id/email", aiLimiter, generateMeetingEmail);
router.post("/:id/tasks", aiLimiter, generateMeetingTasks);

export default router;
