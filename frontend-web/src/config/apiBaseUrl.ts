function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function isLocalBrowserHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

function normalizeToOrigin(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${trimmed}`;
  }
  return `https://${trimmed}`;
}

/**
 * Originea API (fără `/api/v1`).
 * Pe localhost în browser: `VITE_API_BASE_URL` din `.env`.
 * Pe alt host: `backend_domain` din `window.__APP_CONFIG__` (runtime Docker), apoi legacy `domain`, apoi `VITE_DOMAIN`, apoi `window.location.origin`.
 */
export function getApiOrigin(): string {
  if (typeof window === "undefined") {
    const fromEnv = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
    return stripTrailingSlash(fromEnv);
  }
  if (isLocalBrowserHost(window.location.hostname)) {
    const fromEnv = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4001";
    return stripTrailingSlash(fromEnv);
  }
  const runtimeBackend =
    window.__APP_CONFIG__?.backend_domain?.trim() || window.__APP_CONFIG__?.domain?.trim();
  if (runtimeBackend) {
    return stripTrailingSlash(normalizeToOrigin(runtimeBackend));
  }
  const buildDomain = import.meta.env.VITE_DOMAIN?.trim();
  if (buildDomain) {
    return stripTrailingSlash(normalizeToOrigin(buildDomain));
  }
  return stripTrailingSlash(window.location.origin);
}

/** Bază pentru rute de forma `/api/v1/...`. */
export function getApiV1BaseUrl(): string {
  return `${getApiOrigin()}/api/v1`;
}
