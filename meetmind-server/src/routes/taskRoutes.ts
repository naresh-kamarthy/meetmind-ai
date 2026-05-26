import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validationMiddleware.js";
import { createTaskSchema, updateTaskSchema } from "../validators/taskValidator.js";

const router = Router();

router.use(protect);

router.post("/", validate(createTaskSchema), createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);

export default router;
