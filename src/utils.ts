import type { Comment, User } from "./types";
export const creatorOf = (c: Comment): User | undefined => c.commentCreator ?? c.user;
export function getStoredUser(): User | null {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null");
  } catch {
    return null;
  }
}

export function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");