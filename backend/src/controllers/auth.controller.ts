import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { LoginRequest, LoginResponse, RegisterRequest } from "../../../shared/src/db.types.js";
import {
  findUserByEmailOrUsername,
  registerUser,
  userExists,
  validateUserPassword
} from "../services/auth.service.js";

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

    if (await userExists(email, username)) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    await registerUser({ username, email, firstname, lastname, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: unknown) {
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

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT secret is not configured" });
      return;
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        permission_level: user.permission_level
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? "1d" }
    );

    const response: LoginResponse = {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
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
