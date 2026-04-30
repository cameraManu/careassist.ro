export type PermissionLevel = 0 | 1 | 2 | 3 | 4;

export interface RegisterRequest {
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Pick<UsersTable, "id" | "username" | "email" | "firstname" | "lastname" | "permission_level">;
}

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type MeasurementType =
  | "blood_pressure"
  | "blood_glucose"
  | "body_temperature"
  | "weight"
  | "oxygen_saturation"
  | "other";

export interface UsersTable {
  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  device_id: number | null;
  permission_level: PermissionLevel;
}

export interface MetaUsersTable {
  cnp: string;
  user_id: number;
  diagnosis: string | null;
  age: number | null;
  home_address: string | null;
  phone: string | null;
  mail: string | null;
}

export interface DevicesTable {
  id: number;
  description: string;
  sensor_list: Record<string, unknown>;
  date_installed: string;
}

export interface ValuesTable {
  lid: number;
  device_id: number;
  timestamp: string;
  heart_rate: number | null;
  ambient_light: number | null;
  ambient_temperature: number | null;
  ambient_humidity: number | null;
  gas_detected: number | null;
}

export interface ManualValuesTable {
  lid: number;
  user_id: number;
  timestamp: string;
  measurement: MeasurementType;
  value: number;
}

export interface AlertsTable {
  lid: number;
  device_id: number | null;
  user_id: number | null;
  timestamp: string;
  alert_type: string;
  severity: SeverityLevel;
}
