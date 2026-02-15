import { apiClient } from "@/lib/api/client";
import type {
  ApiResponse,
  AuthResponse,
  User,
  LoginBody,
  RegisterBody,
  RefreshBody,
} from "@/lib/api/types";

export async function login(body: LoginBody): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/login", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/register", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken } as unknown as Record<string, unknown>,
  });
  return res.data;
}

export async function me(): Promise<User> {
  const res = await apiClient<ApiResponse<User>>("/auth/me");
  return res.data;
}

export async function logout(refreshToken?: string): Promise<void> {
  await apiClient<unknown>("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken ?? "" } as unknown as Record<string, unknown>,
  });
}
