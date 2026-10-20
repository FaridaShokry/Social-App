import { api } from "./client";
import type { Comment } from "../types";

function findArray<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const k of ["comments", "replies", "items", "data"]) {
      const found = findArray<T>(obj[k]);
      if (found.length) return found;
    }
  }
  return [];
}

function toForm(content: string, image?: File | null) {
  const form = new FormData();
  form.append("content", content);
  if (image) form.append("image", image);
  return form;
}

export async function getComments(postId: string, page = 1, limit = 10) {
  const res = await api<unknown>(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
  const items = findArray<Comment>(res);
  return { items, hasMore: items.length >= limit };
}

export const createComment = (postId: string, content: string, image?: File | null) =>
  api<unknown>(`/posts/${postId}/comments`, { method: "POST", body: toForm(content, image) });

export async function getReplies(postId: string, commentId: string, page = 1, limit = 10) {
  const res = await api<unknown>(
    `/posts/${postId}/comments/${commentId}/replies?page=${page}&limit=${limit}`
  );
  return { items: findArray<Comment>(res) };
}

export const createReply = (postId: string, commentId: string, content: string, image?: File | null) =>
  api<unknown>(`/posts/${postId}/comments/${commentId}/replies`, {
    method: "POST",
    body: toForm(content, image),
  });

export const updateComment = (postId: string, commentId: string, content: string) =>
  api<unknown>(`/posts/${postId}/comments/${commentId}`, { method: "PUT", body: { content } });

export const deleteComment = (postId: string, commentId: string) =>
  api<unknown>(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });

export const likeComment = (postId: string, commentId: string) =>
  api<unknown>(`/posts/${postId}/comments/${commentId}/like`, { method: "PUT" });