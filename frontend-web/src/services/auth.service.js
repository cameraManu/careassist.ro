const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
async function requestJson(options) {
    const headers = {
        "Content-Type": "application/json"
    };
    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }
    const response = await fetch(`${API_BASE_URL}${options.path}`, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = (await response.json().catch(() => ({})));
    if (!response.ok) {
        throw new Error(data.message ?? "Request failed");
    }
    return data;
}
export async function register(payload) {
    return requestJson({
        method: "POST",
        path: "/api/v1/auth/register",
        body: payload
    });
}
export async function login(payload) {
    return requestJson({
        method: "POST",
        path: "/api/v1/auth/login",
        body: payload
    });
}
export async function getCurrentUser(token) {
    return requestJson({
        method: "GET",
        path: "/api/v1/auth/me",
        token
    });
}
