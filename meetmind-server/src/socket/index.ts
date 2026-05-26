import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const parseCookies = (header?: string): Record<string, string> => {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (key) acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
};

let io: Server | null = null;

export interface AvatarUpdatePayload {
  userId: string;
  avatar: string;
  avatarType: string;
  name: string;
  email: string;
}

const authenticateSocket = (socket: Socket): { id: string; role: string } | null => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return null;

    const cookies = parseCookies(rawCookie);
    const token = cookies.accessToken;
    if (!token) return null;

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    return decoded;
  } catch {
    return null;
  }
};

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use((socket, next) => {
    const user = authenticateSocket(socket);
    if (!user) {
      return next(new Error("Unauthorized"));
    }
    socket.data.userId = user.id;
    socket.data.role = user.role;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
};

export const getIO = (): Server | null => io;

export const broadcastAvatarUpdate = (payload: AvatarUpdatePayload): void => {
  if (!io) return;
  io.emit("user:avatar:updated", payload);
};
