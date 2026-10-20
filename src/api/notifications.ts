import { api } from "./client";
import type { AppNotification } from "../types";

function findArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const k of ["notifications", "items", "data"]) {
      const found = findArray<T>(obj[k]);
      if (found.length) return found;
    }
  }
  return [];
}

export async function getNotifications(unread: boolean, page: number, limit = 10) {
  const res = await api<unknown>(
    `/notifications?unread=${unread}&page=${page}&limit=${limit}`
  );
  const items = findArray<AppNotification>(res);
  return { items, hasMore: items.length >= limit };
}

export async function getUnreadCount(): Promise<number> {
  const res = await api<any>("/notifications/unread-count");
  return res?.data?.unreadCount ?? res?.unreadCount ?? res?.data?.count ?? res?.count ?? 0;
}

export const markRead = (id: string) =>
  api<unknown>(`/notifications/${id}/read`, { method: "PATCH" }); // PUT? check the Network tab

export const markAllRead = () =>
  api<unknown>("/notifications/read-all", { method: "PATCH" });

