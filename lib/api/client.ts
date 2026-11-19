/**
 * API client for MoneyTor backend.
 * Requests go to same-origin /api/v1, which proxy.ts forwards to the backend with the internal token.
 * Auth lives entirely in HttpOnly cookies that the backend sets and reads; this code never sees a token.
 */

import Axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_PREFIX = "/api/v1";

function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

/** Requests whose 401 means "wrong credentials" or "session over", never "refresh and retry". */
function isAuthEndpoint(config: { url?: string }): boolean {
  const url = config.url ?? "";
  return ["auth/login", "auth/register", "auth/refresh", "auth/logout"].some((p) => url.includes(p));
}

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Asks the backend to rotate the token cookies, once for all requests that hit 401 together. Each
 * refresh rotates the refresh token, so parallel refreshes would race to overwrite the cookie.
 */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= Axios.post(`${API_PREFIX}/auth/refresh`, undefined, { withCredentials: true })
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

/** Revokes the session on the backend, which also clears the auth cookies. Does not redirect. */
export async function logoutSession(): Promise<void> {
  try {
    await Axios.post(`${API_PREFIX}/auth/logout`, undefined, { withCredentials: true });
  } catch {
    // Backend unreachable: nothing else the browser can do, the cookies are HttpOnly.
  }
}

export const apiAxios = Axios.create({
  baseURL: API_PREFIX,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Backend error payload: { success: false, message: "...", errors: { message: "..." } } or { error: "..." } */
function getApiErrorMessage(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  const errors = obj.errors;
  if (errors != null && typeof errors === "object") {
    const nested = (errors as Record<string, unknown>).message;
    if (typeof nested === "string") return nested;
  }
  const msg = obj.message ?? obj.error ?? obj.msg;
  return typeof msg === "string" ? msg : null;
}

apiAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ success?: boolean; message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401) {
      const message =
        getApiErrorMessage(error.response?.data) ??
        error.message ??
        `Request failed (${error.response?.status ?? "error"})`;
      return Promise.reject(new Error(message));
    }

    if (isAuthEndpoint(originalRequest)) {
      const message =
        getApiErrorMessage(error.response?.data) ??
        error.message ??
        "Unauthorized";
      return Promise.reject(new Error(message));
    }

    if (!originalRequest._retry && (await refreshSession())) {
      originalRequest._retry = true;
      return apiAxios.request(originalRequest);
    }

    // Refresh failed: the backend already cleared the cookies.
    redirectToLogin();
    return Promise.reject(new Error("Session expired"));
  }
);

export interface ApiClientInit extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown> | string;
}

export async function apiClient<T>(path: string, init?: ApiClientInit): Promise<T> {
  const url = path.startsWith("/") ? path : `/${path}`;
  const method = (init?.method ?? "GET").toLowerCase();
  const body = init?.body !== undefined
    ? typeof init.body === "string"
      ? init.body
      : JSON.stringify(init.body)
    : undefined;

  const config = {
    url,
    method,
    data: body,
    headers: init?.headers as Record<string, string> | undefined,
  };

  const response = await apiAxios.request<T>(config);
  return response.data;
}
