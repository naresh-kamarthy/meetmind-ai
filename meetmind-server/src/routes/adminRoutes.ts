import { Router } from "express";
import { getAnalytics, getUsers, updateUserRole, toggleUserStatus, deleteUser } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

// Secure all endpoints with authentication guard & admin privilege check
router.use(protect);
router.use(adminMiddleware);

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.put("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

export default router;
