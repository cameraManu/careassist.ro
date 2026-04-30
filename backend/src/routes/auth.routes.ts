import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";
import type {
  LoginRequest,
  LoginResponse,
  PermissionLevel,
  UsersTable
} from "../../../shared/src/db.types.js";
import { dbPool } from "../config/db.js";
import { authenticateJwt, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

type UserRow = UsersTable & RowDataPacket;

const allowedRoles: PermissionLevel[] = [0, 1, 2, 3, 4];

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const payload = req.body as Partial<LoginRequest>;
  const firstname = payload.firstname?.trim();
  const password = payload.password;

  if (!firstname || !password) {
    res.status(400).json({ message: "firstname and password are required" });
    return;
  }

  const [rows] = await dbPool.query<UserRow[]>(
    "SELECT id, firstname, lastname, password, device_id, permission_level FROM users WHERE firstname = ? LIMIT 1",
    [firstname]
  );

  if (rows.length === 0) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const user = rows[0];
  const passwordMatches =
    user.password === password || (await bcrypt.compare(password, user.password).catch(() => false));

  if (!passwordMatches || !allowedRoles.includes(user.permission_level)) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT secret is not configured" });
    return;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      permission_level: user.permission_level,
      firstname: user.firstname,
      lastname: user.lastname
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "1d" }
  );

  const response: LoginResponse = {
    token,
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      permission_level: user.permission_level
    }
  };

  res.json(response);
});

authRouter.get(
  "/me",
  authenticateJwt,
  requireRoles([0, 1, 2, 3, 4]),
  (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  }
);

authRouter.get(
  "/doctor-area",
  authenticateJwt,
  requireRoles([1, 2, 4]),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "Doctor/Supervisor/Admin access granted",
      user: req.user
    });
  }
);
