import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { MetaUsersTable } from "../../../shared/src/db.types.js";
import { dbPool } from "../config/db.js";

type VitalRow = RowDataPacket & {
  id: number;
  device_id: number;
  timestamp: string;
  heart_rate: number | null;
  ambient_temperature: number | null;
  gas_detected: number | null;
};
type MetaRow = Pick<MetaUsersTable, "user_id" | "age" | "diagnosis"> & RowDataPacket;
type DoctorPatientRow = RowDataPacket & {
  id: number;
  firstname: string;
  lastname: string;
  diagnosis: string | null;
  device_id: number | null;
};
type PrimaryKeyColumnRow = RowDataPacket & {
  COLUMN_NAME: string;
  DATA_TYPE: string;
};
type AlertRow = RowDataPacket & {
  lid: number;
  device_id: number | null;
  user_id: number | null;
  timestamp: string;
  alert_type: string;
  severity: string;
  status: string;
  acknowledged_at: string | null;
  acknowledged_by: number | null;
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTemperature(): number {
  const value = 36 + Math.random() * 2;
  return Number(value.toFixed(1));
}

async function ensureValuesPrimaryKeyAutoIncrement(): Promise<void> {
  const [rows] = await dbPool.query<PrimaryKeyColumnRow[]>(
    `SELECT COLUMN_NAME, DATA_TYPE
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'values'
       AND column_key = 'PRI'
     LIMIT 1`
  );

  const primaryKey = rows[0];
  if (!primaryKey) {
    return;
  }

  const pkColumn = primaryKey.COLUMN_NAME;
  const dataType = primaryKey.DATA_TYPE.toLowerCase();

  const integerType = dataType === "bigint" ? "BIGINT" : "INT";
  await dbPool.query(`ALTER TABLE \`values\` MODIFY \`${pkColumn}\` ${integerType} NOT NULL AUTO_INCREMENT`);
}

export async function getLatestVitals(deviceId: number, limit: number): Promise<VitalRow[]> {
  const [rows] = await dbPool.query<VitalRow[]>(
    `SELECT id, device_id, timestamp, heart_rate, ambient_temperature, gas_detected
     FROM \`values\`
     WHERE device_id = ?
     ORDER BY timestamp DESC
     LIMIT ?`,
    [deviceId, limit]
  );

  return rows;
}

export async function getMetaByUserId(userId: number): Promise<MetaRow | null> {
  const [rows] = await dbPool.query<MetaRow[]>(
    `SELECT user_id, age, diagnosis
     FROM meta_users
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] ?? null;
}

export async function getPatientsByDoctorId(doctorId: number): Promise<DoctorPatientRow[]> {
  const [rows] = await dbPool.query<DoctorPatientRow[]>(
    `SELECT u.id, u.firstname, u.lastname, m.diagnosis, u.device_id
     FROM users u
     LEFT JOIN meta_users m ON u.id = m.user_id
     WHERE u.assigned_doctor_id = ?`,
    [doctorId]
  );

  return rows;
}

export async function seedVitals(deviceId: number): Promise<number> {
  const rows: Array<[number, Date, number, number, number, number, number]> = [];

  for (let index = 0; index < 20; index += 1) {
    const timestamp = new Date(Date.now() - (19 - index) * 60_000);
    rows.push([
      deviceId,
      timestamp,
      randomInt(60, 100),
      randomInt(100, 900),
      randomTemperature(),
      randomInt(30, 80),
      randomInt(0, 1)
    ]);
  }

  const placeholders = rows.map(() => "(?, ?, ?, ?, ?, ?, ?)").join(", ");
  const flattenedValues = rows.flat();

  try {
    const [result] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO \`values\` (
        device_id,
        timestamp,
        heart_rate,
        ambient_light,
        ambient_temperature,
        ambient_humidity,
        gas_detected
      )
       VALUES ${placeholders}`,
      flattenedValues
    );

    return result.affectedRows;
  } catch (error) {
    const dbError = error as { code?: string; sqlMessage?: string };
    const duplicatePrimaryKeyError =
      dbError.code === "ER_DUP_ENTRY" && (dbError.sqlMessage?.includes("PRIMARY") ?? false);

    if (!duplicatePrimaryKeyError) {
      throw error;
    }

    await ensureValuesPrimaryKeyAutoIncrement();

    const [retryResult] = await dbPool.execute<ResultSetHeader>(
      `INSERT INTO \`values\` (
        device_id,
        timestamp,
        heart_rate,
        ambient_light,
        ambient_temperature,
        ambient_humidity,
        gas_detected
      )
       VALUES ${placeholders}`,
      flattenedValues
    );

    return retryResult.affectedRows;
  }
}

export async function acknowledgeAlert(alertId: number, userId: number): Promise<"SUCCESS" | "NOT_FOUND" | "FORBIDDEN" | "ALREADY_ACKNOWLEDGED"> {
  const [rows] = await dbPool.query<AlertRow[]>(
    `SELECT lid, user_id, status, acknowledged_at
     FROM alerts
     WHERE lid = ?`,
    [alertId]
  );

  const alert = rows[0];
  if (!alert) {
    return "NOT_FOUND";
  }

  if (alert.user_id !== userId) {
    return "FORBIDDEN";
  }

  if (alert.status === "acknowledged") {
    return "ALREADY_ACKNOWLEDGED";
  }

  await dbPool.query<ResultSetHeader>(
    `UPDATE alerts
     SET status = 'acknowledged', acknowledged_at = NOW(), acknowledged_by = ?
     WHERE lid = ?`,
    [userId, alertId]
  );

  return "SUCCESS";
}

export async function getDoctorAlerts(userId: number, filters: { severity?: string; status?: string; range?: string }): Promise<AlertRow[]> {
  const { severity, status, range } = filters;
  const conditions: string[] = ["user_id = ?"];
  const params: (string | number)[] = [userId];

  if (severity) {
    conditions.push("severity = ?");
    params.push(severity);
  }

  if (status) {
    conditions.push("status = ?");
    params.push(status);
  }

  if (range) {
    const rangeMapping: Record<string, string> = {
      "1h": "1 HOUR",
      "24h": "1 DAY",
      "7d": "7 DAY"
    };
    if (rangeMapping[range]) {
      conditions.push("timestamp >= NOW() - INTERVAL " + rangeMapping[range]);
    }
  }

  const [rows] = await dbPool.query<AlertRow[]>(
    `SELECT * FROM alerts
     WHERE ${conditions.join(" AND ")}
     ORDER BY timestamp DESC`,
    params
  );

  return rows;
}
