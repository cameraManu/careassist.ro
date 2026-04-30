import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { LoginRequest, RegisterRequest, UsersTable } from "../../../shared/src/db.types.js";
import { dbPool } from "../config/db.js";

type UserRow = UsersTable & RowDataPacket;

export interface RegisterUserInput extends RegisterRequest {}

export interface LoginUserInput extends LoginRequest {}

export async function findUserByEmailOrUsername(identifier: string): Promise<UserRow | null> {
  const [rows] = await dbPool.query<UserRow[]>(
    `SELECT id, username, email, firstname, lastname, password, device_id, permission_level
     FROM users
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [identifier, identifier]
  );

  return rows[0] ?? null;
}

export async function userExists(email: string, username: string): Promise<boolean> {
  const [rows] = await dbPool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [email, username]
  );
  return rows.length > 0;
}

export async function registerUser(input: RegisterUserInput): Promise<void> {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  await dbPool.execute<ResultSetHeader>(
    `INSERT INTO users (username, email, firstname, lastname, password, permission_level)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [input.username, input.email, input.firstname, input.lastname, hashedPassword]
  );
}

export async function validateUserPassword(user: UserRow, plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, user.password);
}
