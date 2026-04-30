import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { PermissionLevel } from "../../../shared/src/db.types.js";

interface JwtPayload {
  sub: number;
  email: string;
  permission_level: PermissionLevel;
  firstname?: string;
  lastname?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    permission_level: PermissionLevel;
    firstname?: string;
    lastname?: string;
  };
}

export function authenticateJwt(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401).json({ message: "Missing or invalid authorization header" });
    return;
  }

  const token = authorization.replace("Bearer ", "").trim();
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      permission_level: decoded.permission_level,
      firstname: decoded.firstname,
      lastname: decoded.lastname
    };
    next();
  } catch {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
}
