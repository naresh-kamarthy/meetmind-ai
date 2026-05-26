import { Request, Response, NextFunction } from "express";
import multer from "multer";

export interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 2MB or smaller."
        : err.message;
    return res.status(400).json({ success: false, message });
  }

  if (err.message?.includes("Only JPG")) {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Centralized Error Handler:", err);

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
