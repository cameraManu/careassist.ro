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
type DoctorAlertRow = RowDataPacket & {
  id: number;
  device_id: number | null;
  user_id: number | null;
  patient_firstname: string | null;
  patient_lastname: string | null;
  timestamp: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged";
  acknowledged_at: string | null;
  acknowledged_by: number | null;
};
type DoctorAlertFilters = {
  severity?: string;
  status?: string;
  range?: string;
};
type AlertOwnershipRow = RowDataPacket & {
  id: number;
  owner_id: number | null;
  status: string | null;
};
type PrimaryKeyColumnRow = RowDataPacket & {
  COLUMN_NAME: string;
  DATA_TYPE: string;
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

export async function getDoctorAlerts(doctorId: number, filters: DoctorAlertFilters): Promise<DoctorAlertRow[]> {
  const conditions: string[] = ["u.assigned_doctor_id = ?"];
  const values: Array<number | string> = [doctorId];

  if (filters.severity && ["low", "medium", "high", "critical"].includes(filters.severity)) {
    conditions.push("a.severity = ?");
    values.push(filters.severity);
  }

  if (filters.status && ["active", "acknowledged"].includes(filters.status)) {
    conditions.push("a.status = ?");
    values.push(filters.status);
  }

  if (filters.range === "1h") {
    conditions.push("a.timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
  } else if (filters.range === "24h") {
    conditions.push("a.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
  } else if (filters.range === "7d") {
    conditions.push("a.timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
  }

  const [rows] = await dbPool.query<DoctorAlertRow[]>(
    `SELECT
      a.lid AS id,
      a.device_id,
      a.user_id,
      u.firstname AS patient_firstname,
      u.lastname AS patient_lastname,
      a.timestamp,
      a.alert_type,
      a.severity,
      a.status,
      a.acknowledged_at,
      a.acknowledged_by
    FROM alerts a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY a.timestamp DESC`,
    values
  );

  return rows;
}

export async function acknowledgeAlert(
  alertId: number,
  doctorId: number
): Promise<"NOT_FOUND" | "FORBIDDEN" | "ALREADY_ACKNOWLEDGED" | "UPDATED"> {
  const [ownershipRows] = await dbPool.query<AlertOwnershipRow[]>(
    `SELECT a.lid AS id, u.assigned_doctor_id AS owner_id, a.status
     FROM alerts a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.lid = ?
     LIMIT 1`,
    [alertId]
  );

  const row = ownershipRows[0];
  if (!row) {
    return "NOT_FOUND";
  }

  if (row.owner_id !== doctorId) {
    return "FORBIDDEN";
  }

  if (row.status === "acknowledged") {
    return "ALREADY_ACKNOWLEDGED";
  }

  await dbPool.execute(
    `UPDATE alerts
     SET status = 'acknowledged',
         acknowledged_at = NOW(),
         acknowledged_by = ?
     WHERE lid = ?`,
    [doctorId, alertId]
  );

  return "UPDATED";
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

