import { api } from "./client";
import type { Post, SuggestedUser, User } from "../types";

// Finds the array inside whatever shape the API returns
function findArray<T>(res: unknown, keys: string[]): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const k of keys) if (Array.isArray(obj[k])) return obj[k] as T[];
    if (obj.data) return findArray<T>(obj.data, keys);
  }
  return [];
}

export async function getProfile(): Promise<User | null> {
  const res = await api<any>("/users/profile-data");
  return res?.data?.user ?? res?.user ?? res?.data ?? null;
}

export async function getSuggestions(limit = 10) {
  const res = await api<unknown>(`/users/suggestions?limit=${limit}`);
  return findArray<SuggestedUser>(res, ["suggestions", "users"]);
}

export const followUser = (id: string) =>
  api<unknown>(`/users/${id}/follow`, { method: "PUT" });

export async function getUserPosts(id: string) {
  const res = await api<unknown>(`/users/${id}/posts`);
  return findArray<Post>(res, ["posts"]);
}

export async function getBookmarks() {
  const res = await api<unknown>("/users/bookmarks");
  return findArray<Post>(res, ["bookmarks", "posts"]);
}

export function uploadPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file); // field name may differ, check the Network tab
  return api<any>("/users/upload-photo", { method: "PUT", body: form });
}