import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserPlus, UserCheck } from "lucide-react";
import Avatar from "./Avatar";
import { followUser, getSuggestions } from "../api/users";
import type { SuggestedUser } from "../types";

const KEY = ["suggestions"];

export default function SuggestedFriends() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data: list = [], isLoading } = useQuery({
    queryKey: KEY,
    queryFn: () => getSuggestions(10),
  });

  const follow = useMutation({
    mutationFn: (u: SuggestedUser) => followUser(u._id),
    onMutate: async (u) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<SuggestedUser[]>(KEY);
      const was = !!u.isFollowing;
      qc.setQueryData<SuggestedUser[]>(KEY, (old) =>
        old?.map((x) =>
          x._id === u._id
            ? { ...x, isFollowing: !was, followersCount: (x.followersCount ?? 0) + (was ? -1 : 1) }
            : x
        )
      );
      return { prev };
    },
    onError: (_e, _u, ctx) => qc.setQueryData(KEY, ctx?.prev),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  const shown = list.filter((f) => f.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <aside className="sticky top-28 h-fit rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5 text-brand" /> Suggested Friends
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold">{shown.length}</span>
      </div>

      <div className="relative mt-4">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search friends..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 outline-none focus:border-brand" />
      </div>

      {isLoading && <p className="mt-4 text-center text-slate-500">Loading...</p>}

      <div className="mt-4 space-y-3">
        {shown.map((f) => (
          <div key={f._id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={f.name} photo={f.photo} size={48} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{f.name}</p>
                <p className="truncate text-sm text-slate-500">@{f.username}</p>
              </div>
              <button onClick={() => follow.mutate(f)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  f.isFollowing ? "bg-brand text-white hover:bg-brand-dark" : "bg-blue-50 text-brand hover:bg-blue-100"
                }`}>
                {f.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {f.isFollowing ? "Following" : "Follow"}
              </button>
            </div>
            <span className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
              {f.followersCount ?? 0} followers
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}