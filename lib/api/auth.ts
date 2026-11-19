import { apiClient, logoutSession } from "@/lib/api/client";
import type {
  ApiResponse,
  AuthResponse,
  User,
  LoginBody,
  RegisterBody,
  ChangePasswordBody,
} from "@/lib/api/types";

/*
 * Login, register, refresh and password change answer with the user only; the backend puts the
 * tokens in HttpOnly cookies on the same response.
 */

export async function login(body: LoginBody): Promise<User | undefined> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/login", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data?.user;
}

export async function register(body: RegisterBody): Promise<User | undefined> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/register", {
    method: "POST",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data?.user;
}

/** Changes the password; the backend signs out other sessions and rotates this session's cookies. */
export async function changePassword(body: ChangePasswordBody): Promise<User | undefined> {
  const res = await apiClient<ApiResponse<AuthResponse>>("/auth/password", {
    method: "PUT",
    body: body as unknown as Record<string, unknown>,
  });
  return res.data?.user;
}

export async function me(): Promise<User> {
  const res = await apiClient<ApiResponse<User>>("/auth/me");
  return res.data;
}

/** Revokes the session and clears the auth cookies. */
export async function logout(): Promise<void> {
  await logoutSession();
}
