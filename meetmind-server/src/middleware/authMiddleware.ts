import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;


export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, session token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, session token expired or invalid" });
  }
};
