import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { PermissionLevel } from "../../../shared/src/db.types.js";

interface TokenPayload {
  sub: number;
  permission_level: PermissionLevel;
  firstname: string;
  lastname: string;
  device_id: number | null;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    permission_level: PermissionLevel;
    firstname: string;
    lastname: string;
    device_id: number | null;
  };
  params: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, string | undefined>;
  headers: Record<string, string | undefined>;
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<TokenPayload>;
  return (
    typeof payload.sub === "number" &&
    typeof payload.permission_level === "number" &&
    typeof payload.firstname === "string" &&
    typeof payload.lastname === "string" &&
    (typeof payload.device_id === "number" || payload.device_id === null)
  );
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
    const decoded = jwt.verify(token, secret);
    if (!isTokenPayload(decoded)) {
      res.status(401).json({ message: "Token payload is invalid" });
      return;
    }

    req.user = {
      id: decoded.sub,
      permission_level: decoded.permission_level,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      device_id: decoded.device_id
    };
    next();
  } catch {
    res.status(401).json({ message: "Token is invalid or expired" });
  }
}
