import { Router } from "express";
import { loginController, registerController } from "../controllers/auth.controller.js";
import { authenticateJwt, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerController);
authRouter.post("/auth/login", loginController);

authRouter.get(
  "/auth/me",
  authenticateJwt,
  requireRoles([0, 1, 2, 3, 4]),
  (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  }
);

authRouter.get(
  "/auth/doctor-area",
  authenticateJwt,
  requireRoles([1, 2, 4]),
  (req: AuthenticatedRequest, res) => {
    res.json({
      message: "Doctor/Supervisor/Admin access granted",
      user: req.user
    });
  }
);
