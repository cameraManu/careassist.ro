import axios from "axios";
import { getApiOrigin } from "../config/apiBaseUrl.js";
function authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
}
export async function fetchDoctorAlerts(token, filters) {
    const response = await axios.get(`${getApiOrigin()}/api/v1/doctor/alerts`, {
        params: filters,
        headers: authHeaders(token)
    });
    return response.data;
}
export async function acknowledgeDoctorAlert(token, alertId) {
    const response = await axios.patch(`${getApiOrigin()}/api/v1/alerts/${alertId}/acknowledge`, {}, { headers: authHeaders(token) });
    return response.data;
}
