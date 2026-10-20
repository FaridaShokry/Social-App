import { useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "./Avatar";
import CommentInput from "./CommentInput";
import CommentItem from "./CommentItem";
import { createComment, getComments } from "../api/comments";
import { errMsg, getStoredUser } from "../utils";

type Props = { postId: string; onCountChange: (delta: number) => void };

export default function CommentsSection({ postId, onCountChange }: Props) {
  const me = getStoredUser();
  const qc = useQueryClient();
  const [sort, setSort] = useState<"relevant" | "newest">("relevant");

  const q = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) => getComments(postId, pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastParam) => (last.hasMore ? lastParam + 1 : undefined),
  });

  const items = useMemo(() => q.data?.pages.flatMap((p) => p.items) ?? [], [q.data]);

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "newest") copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    else copy.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    return copy;
  }, [items, sort]);

  const add = useMutation({
    mutationFn: (v: { text: string; image: File | null }) => createComment(postId, v.text, v.image),
    onSuccess: () => {
      onCountChange(1);
      qc.invalidateQueries({ queryKey: ["comments", postId] });
      qc.invalidateQueries({ queryKey: ["top-comment", postId] });
    },
  });

  return (
    <div className="-mx-6 -mb-6 mt-4 rounded-b-3xl bg-slate-50 p-5">
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <h3 className="flex items-center gap-3 text-lg font-bold">
          Comments
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-600">{items.length}</span>
        </h3>
        <select value={sort} onChange={(e) => setSort(e.target.value as "relevant" | "newest")}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold outline-none">
          <option value="relevant">Most relevant</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {q.isError && <p className="mt-3 text-center text-red-600">{errMsg(q.error)}</p>}
      {q.isLoading && <p className="mt-4 text-center text-slate-500">Loading...</p>}

      <div className="mt-5 space-y-5">
        {sorted.map((c) => (
          <CommentItem key={c._id} postId={postId} comment={c}
            onDeleted={() => {
              onCountChange(-1);
              qc.invalidateQueries({ queryKey: ["comments", postId] });
              qc.invalidateQueries({ queryKey: ["top-comment", postId] });
            }} />
        ))}
      </div>

      {q.hasNextPage && (
        <button onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-2.5 font-semibold text-brand hover:bg-slate-50">
          {q.isFetchingNextPage ? "Loading..." : "View more comments"}
        </button>
      )}

      <div className="mt-5 flex gap-3">
        <Avatar name={me?.name} photo={me?.photo} size={44} />
        <CommentInput placeholder={`Comment as ${me?.name ?? ""} ...`}
          onSubmit={async (text, image) => { await add.mutateAsync({ text, image }); }} />
      </div>
    </div>
  );
}