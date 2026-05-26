import http from "http";
import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { createAdminUser } from "./seed/createAdmin.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { initSocket } from "./socket/index.js";

const PORT = env.PORT;

const startServer = async () => {
  try {
    configureCloudinary();
    await connectDB();
    await createAdminUser();

    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MeetMind AI backend server:", error);
    process.exit(1);
  }
};

startServer();
