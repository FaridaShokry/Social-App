import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Avatar from "./Avatar";
import CommentInput from "./CommentInput";
import {
  createReply, deleteComment, getReplies, likeComment, updateComment,
} from "../api/comments";
import { creatorOf, getStoredUser, timeAgo } from "../utils";
import type { Comment } from "../types";

type Props = {
  postId: string;
  comment: Comment;
  isReply?: boolean;
  onDeleted: (id: string) => void;
};

export default function CommentItem({ postId, comment, isReply, onDeleted }: Props) {
  const qc = useQueryClient();
  const me = getStoredUser();
  const author = creatorOf(comment);
  const mine = !!me && me._id === author?._id;
  const repliesKey = ["replies", postId, comment._id];

  const [content, setContent] = useState(comment.content ?? "");
  const [liked, setLiked] = useState(!!comment.isLiked);
  const [likes, setLikes] = useState(comment.likesCount ?? 0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [repliesCount, setRepliesCount] = useState(comment.repliesCount ?? 0);
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const repliesQ = useQuery({
    queryKey: repliesKey,
    queryFn: async () => (await getReplies(postId, comment._id, 1, 50)).items,
    enabled: showReplies,
  });
  const replies = repliesQ.data ?? [];

  const like = useMutation({
    mutationFn: () => likeComment(postId, comment._id),
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

  const reply = useMutation({
    mutationFn: (v: { text: string; image: File | null }) =>
      createReply(postId, comment._id, v.text, v.image),
    onSuccess: () => {
      setShowReplyBox(false);
      setRepliesCount((c) => c + 1);
      setShowReplies(true);
      qc.invalidateQueries({ queryKey: repliesKey });
    },
  });

  const edit = useMutation({
    mutationFn: (text: string) => updateComment(postId, comment._id, text),
    onSuccess: (_d, text) => {
      setContent(text);
      setEditing(false);
    },
  });

  const remove = useMutation({
    mutationFn: () => deleteComment(postId, comment._id),
    onSuccess: () => onDeleted(comment._id),
  });

  const action = "font-semibold text-slate-500 hover:text-brand";

  return (
    <div className="flex gap-3">
      <Avatar name={author?.name} photo={author?.photo} size={isReply ? 32 : 44} />

      <div className="min-w-0 flex-1">
        <div className="w-fit max-w-full rounded-2xl bg-slate-100 px-4 py-3">
          <p className="font-bold">{author?.name ?? "User"}</p>
          <p className="text-sm text-slate-500">
            {author?.username ? `@${author.username} · ` : ""}{timeAgo(comment.createdAt)}
          </p>

          {editing ? (
            <div className="mt-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2}
                className="w-full min-w-[260px] resize-none rounded-xl border border-slate-300 bg-white p-2 outline-none" />
              <div className="mt-2 flex gap-3 text-sm font-semibold">
                <button onClick={() => draft.trim() && edit.mutate(draft.trim())}
                  disabled={edit.isPending} className="text-brand">
                  {edit.isPending ? "Saving..." : "Save"}
                </button>
                <button onClick={() => { setEditing(false); setDraft(content); }} className="text-slate-500">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            content && <p className="mt-1 whitespace-pre-wrap">{content}</p>
          )}

          {comment.image && <img src={comment.image} alt="" className="mt-2 max-h-60 rounded-xl" />}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-4 px-2 text-sm">
          <span className="text-slate-500">{timeAgo(comment.createdAt)}</span>
          <button onClick={() => like.mutate()} className={liked ? "font-semibold text-rose-600" : action}>
            Like ({likes})
          </button>
          {!isReply && (
            <button onClick={() => setShowReplyBox((v) => !v)} className={action}>Reply</button>
          )}
          {mine && !editing && <button onClick={() => setEditing(true)} className={action}>Edit</button>}
          {mine && (
            <button onClick={() => confirm("Delete this comment?") && remove.mutate()}
              className="font-semibold text-slate-500 hover:text-red-600">
              Delete
            </button>
          )}
        </div>

        {!isReply && repliesCount > 0 && (
          <button onClick={() => setShowReplies((v) => !v)} className="mt-2 px-2 text-sm font-semibold text-brand">
            {showReplies ? "Hide replies" : `View replies (${repliesCount})`}
          </button>
        )}
        {repliesQ.isFetching && <p className="mt-2 px-2 text-sm text-slate-500">Loading...</p>}

        {showReplies && (
          <div className="mt-3 space-y-4">
            {replies.map((r) => (
              <CommentItem key={r._id} postId={postId} comment={r} isReply
                onDeleted={() => {
                  setRepliesCount((c) => Math.max(0, c - 1));
                  qc.invalidateQueries({ queryKey: repliesKey });
                }} />
            ))}
          </div>
        )}

        {showReplyBox && (
          <div className="mt-3 flex gap-3">
            <Avatar name={me?.name} photo={me?.photo} size={32} />
            <CommentInput autoFocus placeholder={`Reply to ${author?.name ?? "comment"}...`}
              onSubmit={async (text, image) => { await reply.mutateAsync({ text, image }); }} />
          </div>
        )}
      </div>
    </div>
  );
}