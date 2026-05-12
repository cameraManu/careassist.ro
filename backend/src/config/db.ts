import type { PoolOptions } from "mysql2/promise";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10);

/**
 * Mediu Docker: `db_host`, `db_name`, `db_user`, `db_pass` (opțional `db_port`).
 * Dev local: doar variabilele `MYSQL_*` din `.env` (fără `db_host`).
 */
function resolvePoolConfig(): PoolOptions {
  const dockerHost = process.env.db_host?.trim();
  if (dockerHost) {
    return {
      host: dockerHost,
      port: Number(process.env.db_port ?? process.env.MYSQL_PORT ?? 3306),
      user: process.env.db_user?.trim() || process.env.MYSQL_USER || "root",
      password: process.env.db_pass ?? process.env.MYSQL_PASSWORD ?? "",
      database: process.env.db_name?.trim() || process.env.MYSQL_DATABASE || "careassist",
      connectionLimit,
      waitForConnections: true,
      queueLimit: 0
    };
  }

  return {
    host: process.env.MYSQL_HOST ?? "localhost",
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "carreassist",
    connectionLimit,
    waitForConnections: true,
    queueLimit: 0
  };
}

export const dbPool = mysql.createPool(resolvePoolConfig());

export async function verifyDatabaseConnection(): Promise<void> {
  await dbPool.query("SELECT 1");
}
