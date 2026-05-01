import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../../../shared/src/db.types.js";
import {
  findExistingUserIdentifier,
  findUserById,
  findUserByEmailOrUsername,
  registerUser,
  validateUserPassword
} from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

const allowedRoles = new Set([0, 1, 2, 3, 4]);

export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as Partial<RegisterRequest>;

    const username = payload.username?.trim();
    const email = payload.email?.trim().toLowerCase();
    const firstname = payload.firstname?.trim();
    const lastname = payload.lastname?.trim();
    const password = payload.password;

    if (!username || !email || !firstname || !lastname || !password) {
      res.status(400).json({ message: "username, email, firstname, lastname and password are required" });
      return;
    }

    const existingUser = await findExistingUserIdentifier(email, username);
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({ message: "Email already exists" });
        return;
      }

      if (existingUser.username === username) {
        res.status(409).json({ message: "Username already exists" });
        return;
      }

      res.status(409).json({ message: "User already exists" });
      return;
    }

    await registerUser({ username, email, firstname, lastname, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: unknown) {
    console.error(error);
    const dbError = error as { code?: string };
    if (dbError.code === "ER_BAD_FIELD_ERROR") {
      res.status(500).json({ message: "Database schema is out of date. Please run backend/db/database_schema.sql" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as Partial<LoginRequest>;
    const identifier = payload.identifier?.trim().toLowerCase();
    const password = payload.password;

    if (!identifier || !password) {
      res.status(400).json({ message: "identifier and password are required" });
      return;
    }

    const user = await findUserByEmailOrUsername(identifier);

    if (!user || !(await validateUserPassword(user, password))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if (!allowedRoles.has(user.permission_level)) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT secret is not configured" });
      return;
    }
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? "1d") as SignOptions["expiresIn"];

    const token = jwt.sign(
      {
        sub: user.id,
        permission_level: user.permission_level,
        firstname: user.firstname,
        lastname: user.lastname,
        device_id: user.device_id
      },
      secret,
      { expiresIn }
    );

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        device_id: user.device_id,
        permission_level: user.permission_level
      }
    };

    res.json(response);
  } catch (error: unknown) {
    const dbError = error as { code?: string };
    if (dbError.code === "ER_BAD_FIELD_ERROR") {
      res.status(500).json({ message: "Database schema is out of date. Please run backend/db/database_schema.sql" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function meController(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        device_id: user.device_id,
        permission_level: user.permission_level
      }
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
}
