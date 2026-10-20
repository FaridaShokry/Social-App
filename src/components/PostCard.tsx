import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ThumbsUp, Repeat2, MessageCircle, Share2, Bookmark,
  MoreHorizontal, Pencil, Trash2, Globe,
} from "lucide-react";
import Avatar from "./Avatar";
import CommentsSection from "./CommentsSection";
import TopComment from "./TopComment";
import ConfirmModal from "./ConfirmModal";
import { bookmarkPost, deletePost, likePost, sharePost, updatePost } from "../api/posts";
import { errMsg, getStoredUser, timeAgo } from "../utils";
import type { Post } from "../types";

type Props = { post: Post; onDeleted?: (id: string) => void; startOpen?: boolean };

export default function PostCard({ post, onDeleted, startOpen = false }: Props) {
  const qc = useQueryClient();
  const me = getStoredUser();
  const isMine = !!me && me._id === post.user?._id;

  const [body, setBody] = useState(post.body ?? "");
  const [privacy, setPrivacy] = useState(post.privacy ?? "public");
  const [liked, setLiked] = useState(!!post.isLiked);
  const [likes, setLikes] = useState(post.likesCount ?? 0);
  const [saved, setSaved] = useState(!!post.isBookmarked);
  const [shares, setShares] = useState(post.sharesCount ?? 0);
  const [showComments, setShowComments] = useState(startOpen);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(body);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  // ---- mutations ----
  const like = useMutation({
    mutationFn: () => likePost(post._id),
    onMutate: () => {
      const prev = { liked, likes };
      setLiked(!liked);
      setLikes(likes + (liked ? -1 : 1));
      return prev;
    },
    onError: (_e, _v, prev) => {
      if (prev) { setLiked(prev.liked); setLikes(prev.likes); }
    },
  });

  const save = useMutation({
    mutationFn: () => bookmarkPost(post._id),
    onMutate: () => {
      const prev = saved;
      setSaved(!prev);
      return prev;
    },
    onError: (_e, _v, prev) => setSaved(!!prev),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmarks"] }),
  });

  const share = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => setShares((s) => s + 1),
  });

  const edit = useMutation({
    mutationFn: (v: { body: string; privacy: string }) => {
      const form = new FormData();
      form.append("body", v.body);
      form.append("privacy", v.privacy);
      return updatePost(post._id, form);
    },
    onSuccess: (_d, v) => {
      setBody(v.body);
      setPrivacy(v.privacy);
      setEditing(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      setConfirmOpen(false);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });
      qc.invalidateQueries({ queryKey: ["bookmarks"] });
      onDeleted?.(post._id);
    },
  });

  const btn =
    "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 font-semibold text-slate-600 transition hover:bg-slate-50";
  const menuItem =
    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition hover:bg-slate-50";

  return (
    <article className="rounded-3xl bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={post.user?.name} photo={post.user?.photo} size={56} />
          <div>
            <p className="text-lg font-bold">{post.user?.name}</p>
            <p className="flex items-center gap-2 text-sm text-slate-500">
              {post.user?.username && <span>@{post.user.username}</span>}
              <span>· {timeAgo(post.createdAt)}</span>
              <span>·</span>
              {isMine ? (
                <select value={privacy}
                  onChange={(e) => edit.mutate({ body, privacy: e.target.value })}
                  className="cursor-pointer bg-transparent text-slate-800 outline-none">
                  <option value="public">Public</option>
                  <option value="following">Followers</option>
                  <option value="only me">Only me</option>
                </select>
              ) : (
                <span className="flex items-center gap-1 text-slate-800">
                  <Globe className="h-4 w-4" /> {privacy === "public" ? "Public" : privacy}
                </span>
              )}
            </p>
          </div>
        </div>

        <div ref={menuRef} className="relative">
          <button onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100" title="More">
            <MoreHorizontal className="h-6 w-6" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
              <button onClick={() => { setMenuOpen(false); save.mutate(); }} className={menuItem}>
                <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
                {saved ? "Unsave post" : "Save post"}
              </button>

              {isMine && (
                <>
                  <button onClick={() => { setMenuOpen(false); setDraft(body); setEditing(true); }}
                    className={menuItem}>
                    <Pencil className="h-5 w-5" /> Edit post
                  </button>
                  <button onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                    className={`${menuItem} !text-rose-600 hover:!bg-rose-50`}>
                    <Trash2 className="h-5 w-5" /> Delete post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {editing ? (
        <div className="mt-4">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} autoFocus
            className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 p-4 text-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          {edit.isError && <p className="mt-2 text-sm text-red-600">{errMsg(edit.error)}</p>}
          <div className="mt-3 flex justify-end gap-3">
            <button onClick={() => setEditing(false)}
              className="rounded-xl border border-slate-200 px-5 py-2 font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={() => edit.mutate({ body: draft.trim(), privacy })}
              disabled={edit.isPending || !draft.trim()}
              className="rounded-xl bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
              {edit.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        body && <p className="mt-4 whitespace-pre-wrap text-lg">{body}</p>
      )}

      {post.image && <img src={post.image} alt="" className="mt-4 w-full rounded-2xl object-cover" />}

      <div className="mt-4 flex items-center justify-between text-slate-500">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-white">
            <ThumbsUp className="h-4 w-4" />
          </span>
          {likes} likes
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Repeat2 className="h-4 w-4" /> {shares} shares</span>
          <span>{commentsCount} comments</span>
          <Link to={`/posts/${post._id}`} className="font-semibold text-blue-600 hover:underline">
            View details
          </Link>
        </div>
      </div>

      <div className="mt-3 flex border-t border-slate-200 pt-3">
        <button onClick={() => like.mutate()} className={`${btn} ${liked ? "!text-blue-600" : ""}`}>
          <ThumbsUp className="h-5 w-5" fill={liked ? "currentColor" : "none"} /> Like
        </button>
        <button onClick={() => setShowComments((v) => !v)} className={btn}>
          <MessageCircle className="h-5 w-5" /> Comment
        </button>
        <button onClick={() => share.mutate()} className={btn}>
          <Share2 className="h-5 w-5" /> Share
        </button>
      </div>

      {showComments ? (
        <CommentsSection postId={post._id}
          onCountChange={(d) => setCommentsCount((c) => Math.max(0, c + d))} />
      ) : (
        commentsCount > 0 && <TopComment post={post} onViewAll={() => setShowComments(true)} />
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete this post?"
        message="This post will be permanently removed from your profile and feed."
        confirmText="Delete post"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  );
}