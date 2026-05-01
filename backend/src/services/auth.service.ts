import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { LoginRequest, PermissionLevel, RegisterRequest, UsersTable } from "../../../shared/src/db.types.js";
import { dbPool } from "../config/db.js";

type UserRow = UsersTable & RowDataPacket;
type ExistingUserIdentifierRow = RowDataPacket & Pick<RegisterRequest, "email" | "username">;

export interface RegisterUserInput extends RegisterRequest {}

export interface LoginUserInput extends LoginRequest {}

function resolveRegistrationPermissionLevel(email: string): PermissionLevel {
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.endsWith("@med.careassist.ro")) {
    return 2;
  }

  if (normalizedEmail.endsWith("@staff.careassist.ro")) {
    return 3;
  }

  return 1;
}

export async function findUserByEmailOrUsername(identifier: string): Promise<UserRow | null> {
  const [rows] = await dbPool.query<UserRow[]>(
    `SELECT id, username, email, firstname, lastname, password, device_id, permission_level
     FROM \`users\`
     WHERE email = ? OR username = ?
     LIMIT 1`,
    [identifier, identifier]
  );

  return rows[0] ?? null;
}

export async function findUserById(userId: number): Promise<UserRow | null> {
  const [rows] = await dbPool.query<UserRow[]>(
    `SELECT id, username, email, firstname, lastname, password, device_id, permission_level
     FROM \`users\`
     WHERE id = ?
     LIMIT 1`,
    [userId]
  );

  return rows[0] ?? null;
}

export async function findExistingUserIdentifier(
  email: string,
  username: string
): Promise<ExistingUserIdentifierRow | null> {
  const [rows] = await dbPool.query<ExistingUserIdentifierRow[]>(
    "SELECT email, username FROM `users` WHERE email = ? OR username = ? LIMIT 1",
    [email, username]
  );

  return rows[0] ?? null;
}

export async function registerUser(input: RegisterUserInput): Promise<void> {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const permissionLevel = resolveRegistrationPermissionLevel(input.email);
  if (permissionLevel === 4) {
    throw new Error("Admin accounts cannot be created from public registration");
  }

  await dbPool.execute<ResultSetHeader>(
    `INSERT INTO \`users\` (
      firstname,
      lastname,
      username,
      email,
      password,
      device_id,
      permission_level,
      creation_date,
      deleted
    )
    VALUES (?, ?, ?, ?, ?, NULL, ?, NOW(), NULL)`,
    [input.firstname, input.lastname, input.username, input.email, hashedPassword, permissionLevel]
  );
}

export async function validateUserPassword(user: UserRow, plainPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, user.password);
}
