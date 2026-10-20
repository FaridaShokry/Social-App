import { api } from "./client";
import type { Post } from "../types";

// The response shape is unknown, so we accept the common variants.
type PostsResponse = {
  posts?: Post[];
  data?: Post[] | { posts?: Post[] };
};

export function extractPosts(res: PostsResponse): Post[] {
  if (Array.isArray(res.posts)) return res.posts;
  if (Array.isArray(res.data)) return res.data;
  return res.data?.posts ?? [];
}

export const getFeed = (limit = 10) =>
  api<PostsResponse>(`/posts/feed?only=following&limit=${limit}`);

export const getAllPosts = () => api<PostsResponse>("/posts");

export const createPost = (form: FormData) =>
  api<unknown>("/posts", { method: "POST", body: form });

export const deletePost = (id: string) =>
  api<unknown>(`/posts/${id}`, { method: "DELETE" });

export const likePost = (id: string) =>
  api<unknown>(`/posts/${id}/like`, { method: "PUT" });

export const bookmarkPost = (id: string) =>
  api<unknown>(`/posts/${id}/bookmark`, { method: "PUT" });

export const sharePost = (id: string) =>
  api<unknown>(`/posts/${id}/share`, { method: "PUT" });

export const getLikes = (id: string, page = 1, limit = 20) =>
  api<unknown>(`/posts/${id}/likes?page=${page}&limit=${limit}`);

export async function getPost(id: string) {
  const res = await api<any>(`/posts/${id}`);
  return (res?.data?.post ?? res?.post ?? res?.data ?? null) as Post | null;
}

export const updatePost = (id: string, form: FormData) =>
  api<unknown>(`/posts/${id}`, { method: "PUT", body: form }); // PATCH? check the Network tab