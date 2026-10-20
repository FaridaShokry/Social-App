export const BASE = "https://route-posts.routemisr.com";

type Options = { method?: string; body?: unknown };

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const isForm = body instanceof FormData;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`; // change here if the API wants a different header
  if (body && !isForm) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Something went wrong");
  return data as T;
}