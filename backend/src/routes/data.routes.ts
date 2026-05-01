import { Router } from "express";
import type { QueryError } from "mysql2";
import { authenticateJwt, type AuthenticatedRequest } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";
import { getLatestVitals, getMetaByUserId, getPatientsByDoctorId, seedVitals } from "../services/data.service.js";

export const dataRouter = Router();

dataRouter.get("/doctor/patients", authenticateJwt, requireRoles([2]), async (req: AuthenticatedRequest, res) => {
  try {
    const doctorId = req.user?.id;
    if (!doctorId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const patients = await getPatientsByDoctorId(doctorId);
    res.json({ patients });
  } catch (error) {
    console.error("Failed to fetch doctor patients", error);
    res.status(500).json({ message: "Failed to fetch doctor patients" });
  }
});

dataRouter.get("/vitals/:deviceId", authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    const deviceId = Number(req.params.deviceId);
    if (!Number.isInteger(deviceId) || deviceId <= 0) {
      res.status(400).json({ message: "deviceId must be a positive integer" });
      return;
    }

    const vitals = await getLatestVitals(deviceId, 10);
    res.json({ records: vitals });
  } catch (error) {
    console.error("Failed to fetch vitals", error);
    res.status(500).json({ message: "Failed to fetch vitals" });
  }
});

dataRouter.get("/meta/:userId", authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "userId must be a positive integer" });
      return;
    }

    const meta = await getMetaByUserId(userId);
    if (!meta) {
      res.status(404).json({ message: "Meta information not found" });
      return;
    }

    res.json(meta);
  } catch (error) {
    console.error("Failed to fetch meta information", error);
    res.status(500).json({ message: "Failed to fetch meta information" });
  }
});

dataRouter.post("/dev/seed-vitals", authenticateJwt, async (req: AuthenticatedRequest, res) => {
  try {
    const rawDeviceId = (req.body as { device_id?: number }).device_id;
    const deviceId = Number(rawDeviceId);

    if (!Number.isInteger(deviceId) || deviceId <= 0) {
      res.status(400).json({ message: "device_id must be a positive integer" });
      return;
    }

    const insertedRows = await seedVitals(deviceId);
    res.status(201).json({ message: "Vitals seeded successfully", insertedRows, device_id: deviceId });
  } catch (error) {
    console.error(error);
    const dbError = error as QueryError;

    if (dbError.code === "ER_NO_REFERENCED_ROW_2") {
      res.status(400).json({
        message: "Invalid device_id. The device does not exist in the devices table."
      });
      return;
    }

    console.error("Failed to seed vitals", error);
    res.status(500).json({ message: "Failed to seed vitals" });
  }
});
