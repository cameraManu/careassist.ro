import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT ?? 10);

export const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "localhost",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? "carreassist",
  connectionLimit,
  waitForConnections: true,
  queueLimit: 0
});

export async function verifyDatabaseConnection(): Promise<void> {
  await dbPool.query("SELECT 1");
}
