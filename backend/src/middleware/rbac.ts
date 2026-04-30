import type { NextFunction, Response } from "express";
import type { PermissionLevel } from "../../../shared/src/db.types.js";
import type { AuthenticatedRequest } from "./auth.js";

export function requireRoles(allowedRoles: PermissionLevel[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const level = req.user?.permission_level;

    if (level === undefined) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(level)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
