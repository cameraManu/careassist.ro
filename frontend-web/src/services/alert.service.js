import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}
export async function fetchDoctorAlerts(token, filters) {
    const response = await axios.get(`${API_BASE_URL}/api/v1/doctor/alerts`, {
        params: filters,
        headers: authHeaders(token)
    });
    return response.data;
}
export async function acknowledgeDoctorAlert(token, alertId) {
    const response = await axios.patch(`${API_BASE_URL}/api/v1/alerts/${alertId}/acknowledge`, {}, { headers: authHeaders(token) });
    return response.data;
}
