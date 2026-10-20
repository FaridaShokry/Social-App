const BASE = "https://route-posts.routemisr.com";
import type { User } from "../types";
export interface SignUpPayload {
  name: string;
  username?: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  password: string;
  rePassword: string;
}

export interface SignInPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  data?: { token?: string; user?: User };
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Something went wrong");
  }
  return data as T;
}

export const signUp = (payload: SignUpPayload) =>
  request<AuthResponse>("/users/signup", payload);

export const signIn = (payload: SignInPayload) =>
  request<AuthResponse>("/users/signin", payload);