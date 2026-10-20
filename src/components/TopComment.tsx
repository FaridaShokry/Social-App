import { useQuery } from "@tanstack/react-query";
import Avatar from "./Avatar";
import { getComments } from "../api/comments";
import { creatorOf } from "../utils";
import type { Post } from "../types";

type Props = { post: Post; onViewAll: () => void };

export default function TopComment({ post, onViewAll }: Props) {
  // only fetch when the feed didn't already include a top comment
  const { data } = useQuery({
    queryKey: ["top-comment", post._id],
    queryFn: async () => (await getComments(post._id, 1, 1)).items[0] ?? null,
    enabled: !post.topComment,
  });

  const comment = post.topComment ?? data;
  if (!comment) return null;
  const author = creatorOf(comment);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Top comment</p>
      <div className="mt-3 flex gap-3">
        <Avatar name={author?.name} photo={author?.photo} size={40} />
        <div className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3">
          <p className="font-bold">{author?.name}</p>
          {comment.content && <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>}
          {comment.image && <img src={comment.image} alt="" className="mt-2 max-h-40 rounded-xl" />}
        </div>
      </div>
      <button onClick={onViewAll} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">
        View all comments
      </button>
    </div>
  );
}