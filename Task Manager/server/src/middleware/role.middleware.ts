// middleware/role.middleware.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.ts";

/**
 * Admin-only access
 */
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
