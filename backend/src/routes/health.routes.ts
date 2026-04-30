import { Router } from "express";
import { dbPool } from "../config/db.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const startedAt = Date.now();
  await dbPool.query("SELECT 1");
  const latencyMs = Date.now() - startedAt;

  res.json({
    status: "ok",
    transport: "REST JSON",
    alertTargetSlaSeconds: 10,
    dbLatencyMs: latencyMs
  });
});
