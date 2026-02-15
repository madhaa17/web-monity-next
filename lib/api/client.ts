/**
 * API client for Monity backend.
 *
 * Token storage (why localStorage, not cookie):
 * - Monity API is external and returns token in JSON body (no Set-Cookie).
 * - Without a BFF, the frontend stores the token after login. A cookie set from
 *   JavaScript cannot be httpOnly, so it does not add security over localStorage.
 * - httpOnly cookies would require the server (or a BFF) to set the cookie.
 * - For this setup we use localStorage for simplicity; switch to cookie when
 *   using a BFF or when the API supports setting cookies with CORS credentials.
 */

import Axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const API_PREFIX = "/api/v1";

const NO_AUTH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

function pathNeedsAuth(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return !NO_AUTH_PATHS.some((p) => normalized === p || normalized.startsWith(`${p}?`));
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}

/** Returns token only in browser; null on server. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("monity_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("monity_refresh_token");
}

export function setTokens(token: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("monity_token", token);
  localStorage.setItem("monity_refresh_token", refreshToken);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("monity_token");
  localStorage.removeItem("monity_refresh_token");
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

function isRefreshRequest(config: { url?: string; baseURL?: string }): boolean {
  const url = config.url ?? "";
  return url.includes("auth/refresh");
}

const baseURL = `${getBaseUrl().replace(/\/$/, "")}${API_PREFIX}`;

export const apiAxios = Axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAxios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const path = config.url ?? "";
  if (pathNeedsAuth(path)) {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/** Backend error payload: { success: false, message: "..." } or { error: "..." } */
function getApiErrorMessage(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
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

    if (isRefreshRequest(originalRequest)) {
      clearTokens();
      redirectToLogin();
      return Promise.reject(new Error("Session expired"));
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      redirectToLogin();
      return Promise.reject(new Error("Not authenticated"));
    }

    try {
      const { data } = await apiAxios.post<{ data: { Token: string; RefreshToken: string } }>(
        "/auth/refresh",
        { refresh_token: refreshToken }
      );
      const token = data?.data?.Token;
      const newRefreshToken = data?.data?.RefreshToken;
      if (token && newRefreshToken) {
        setTokens(token, newRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiAxios.request(originalRequest);
      }
    } catch {
      // refresh failed
    }

    clearTokens();
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
