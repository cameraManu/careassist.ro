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

healthRouter.get("/patients", async (_req, res) => {
  try {
    const [rows] = await dbPool.query(
      "SELECT id, firstname, lastname FROM users WHERE permission_level > 1 ORDER BY firstname, lastname"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Failed to fetch patients" });
  }
});
