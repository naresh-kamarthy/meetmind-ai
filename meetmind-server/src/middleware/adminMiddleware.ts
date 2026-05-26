import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authMiddleware.js";

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
};
