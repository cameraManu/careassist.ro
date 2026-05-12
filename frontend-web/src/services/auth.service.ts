import type { LoginRequest, LoginResponse, RegisterRequest } from "../../../shared/src/db.types";
import { getApiOrigin } from "../config/apiBaseUrl.js";

type RequestMethod = "GET" | "POST";

interface RequestOptions {
  method: RequestMethod;
  path: string;
  token?: string;
  body?: unknown;
}

async function requestJson<T>(options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${getApiOrigin()}${options.path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
  }

  return data as T;
}

export async function register(payload: RegisterRequest): Promise<{ message: string }> {
  return requestJson<{ message: string }>({
    method: "POST",
    path: "/api/v1/auth/register",
    body: payload
  });
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  return requestJson<LoginResponse>({
    method: "POST",
    path: "/api/v1/auth/login",
    body: payload
  });
}

export async function getCurrentUser(token: string): Promise<{ user: LoginResponse["user"] }> {
  return requestJson<{ user: LoginResponse["user"] }>({
    method: "GET",
    path: "/api/v1/auth/me",
    token
  });
}
