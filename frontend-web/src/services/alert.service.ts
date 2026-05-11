import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";

export interface DoctorAlert {
  id: number;
  device_id: number | null;
  user_id: number | null;
  patient_firstname: string | null;
  patient_lastname: string | null;
  timestamp: string;
  alert_type: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged";
  acknowledged_at?: string | null;
  acknowledged_by?: number | null;
}

export interface DoctorAlertsResponse {
  alerts: DoctorAlert[];
}

export interface DoctorAlertsFilters {
  severity?: string;
  status?: string;
  range?: string;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchDoctorAlerts(
  token: string,
  filters: DoctorAlertsFilters
): Promise<DoctorAlertsResponse> {
  const response = await axios.get<DoctorAlertsResponse>(`${API_BASE_URL}/api/v1/doctor/alerts`, {
    params: filters,
    headers: authHeaders(token)
  });
  return response.data;
}

export async function acknowledgeDoctorAlert(token: string, alertId: number): Promise<{ message: string }> {
  const response = await axios.patch<{ message: string }>(
    `${API_BASE_URL}/api/v1/alerts/${alertId}/acknowledge`,
    {},
    { headers: authHeaders(token) }
  );
  return response.data;
}
