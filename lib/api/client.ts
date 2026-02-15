/**
 * API client for Monity backend.
 * Token is stored in cookies: access token readable by client (for Authorization header),
 * refresh token httpOnly; set/clear/refresh via /api/auth/session, /api/auth/logout, /api/auth/refresh.
 */

import Axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { MONITY_TOKEN } from "@/lib/auth/cookies";

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

function validToken(value: string | null): string | null {
  if (value == null || value === "" || value === "undefined") return null;
  return value;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Returns access token from cookie in browser; null on server or if invalid. */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return validToken(getCookie(MONITY_TOKEN));
}

/** Client cannot read httpOnly refresh token; returns null. Used only server-side in refresh route. */
export function getRefreshToken(): string | null {
  return null;
}

/** Sets auth cookies via Next.js session route. Call after login/register. */
export async function setTokens(token: string, refreshToken: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!token || !refreshToken) return;
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, refreshToken }),
  });
}

/** Clears auth cookies via Next.js logout route. Does not redirect. */
export async function clearTokens(): Promise<void> {
  if (typeof window === "undefined") return;
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
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

const REFRESH_ROUTE = "/api/auth/refresh";

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
      await clearTokens();
      redirectToLogin();
      return Promise.reject(new Error("Session expired"));
    }

    try {
      const refreshRes = await fetch(REFRESH_ROUTE, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        return apiAxios.request(originalRequest);
      }
    } catch {
      // refresh failed
    }

    await clearTokens();
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
