import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { helmetMiddleware } from "./middleware/security.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import { env } from "./config/env.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmetMiddleware);

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "MeetMind AI API is running..." });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    security: {
      helmet: true,
      cors: true,
      rateLimit: true,
      httpOnlyCookies: true,
    },
  });
});

app.use(errorHandler);

export default app;
