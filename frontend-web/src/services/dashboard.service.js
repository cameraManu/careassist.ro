import { getApiOrigin } from "../config/apiBaseUrl.js";
async function getJson(options) {
    const response = await fetch(`${getApiOrigin()}${options.path}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${options.token}`
        }
    });
    const data = (await response.json().catch(() => ({})));
    if (!response.ok) {
        throw new Error(data.message ?? "Request failed");
    }
    return data;
}
export async function fetchCurrentUser(token) {
    return getJson({ path: "/api/v1/auth/me", token });
}
export async function fetchVitals(token, deviceId) {
    return getJson({ path: `/api/v1/vitals/${deviceId}`, token });
}
export async function fetchMeta(token, userId) {
    return getJson({ path: `/api/v1/meta/${userId}`, token });
}
