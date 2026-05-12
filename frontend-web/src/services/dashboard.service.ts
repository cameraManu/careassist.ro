import type { MetaUsersTable } from "../../../shared/src/db.types";
import { getApiOrigin } from "../config/apiBaseUrl.js";

interface RequestOptions {
  path: string;
  token: string;
}

async function getJson<T>(options: RequestOptions): Promise<T> {
  const response = await fetch(`${getApiOrigin()}${options.path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.token}`
    }
  });

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data;
}

export interface CurrentUserResponse {
  user: {
    id: number;
    firstname: string;
    lastname: string;
    device_id: number | null;
    permission_level: number;
  };
}

export interface VitalsResponse {
  records: Array<{
    id: number;
    timestamp: string;
    heart_rate: number | null;
    ambient_temperature: number | null;
    gas_detected: number | null;
  }>;
}

export interface MetaResponse extends Pick<MetaUsersTable, "user_id" | "age" | "diagnosis"> {}

export async function fetchCurrentUser(token: string): Promise<CurrentUserResponse> {
  return getJson<CurrentUserResponse>({ path: "/api/v1/auth/me", token });
}

export async function fetchVitals(token: string, deviceId: number): Promise<VitalsResponse> {
  return getJson<VitalsResponse>({ path: `/api/v1/vitals/${deviceId}`, token });
}

export async function fetchMeta(token: string, userId: number): Promise<MetaResponse> {
  return getJson<MetaResponse>({ path: `/api/v1/meta/${userId}`, token });
}
