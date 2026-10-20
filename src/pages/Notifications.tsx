import { useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import Navbar from "../components/navbar";
import Avatar from "../components/Avatar";
import { getNotifications, markAllRead, markRead } from "../api/notifications";
import { errMsg, timeAgo } from "../utils";
import type { AppNotification } from "../types";

const isRead = (n: AppNotification) => !!(n.isRead ?? n.read);

function describe(n: AppNotification): string {
  switch (n.type) {
    case "like": return "liked your post";
    case "comment": return "commented on your post";
    case "share": return "shared your post";
    case "follow": return "started following you";
    default: return n.message ?? "sent you a notification";
  }
}

export default function Notifications() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "unread">("all");

  const q = useInfiniteQuery({
    queryKey: ["notifications", tab],
    queryFn: ({ pageParam }) => getNotifications(tab === "unread", pageParam, 10),
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastParam) => (last.hasMore ? lastParam + 1 : undefined),
  });
  const items = q.data?.pages.flatMap((p) => p.items) ?? [];

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["unread-count"] });
  };

  const readAll = useMutation({ mutationFn: markAllRead, onSuccess: refresh });
  const readOne = useMutation({ mutationFn: (id: string) => markRead(id), onSuccess: refresh });

  const hasUnread = items.some((n) => !isRead(n));
  const error = q.error ?? readAll.error ?? readOne.error;
  const pill = (active: boolean) =>
    `rounded-full px-6 py-2.5 font-semibold transition ${
      active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-6 py-6">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold">Notifications</h1>
                <p className="mt-2 text-slate-500">Realtime updates for likes, comments, shares, and follows.</p>
              </div>
              <button onClick={() => readAll.mutate()} disabled={!hasUnread || readAll.isPending}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50">
                <CheckCheck className="h-5 w-5" /> Mark all as read
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setTab("all")} className={pill(tab === "all")}>All</button>
              <button onClick={() => setTab("unread")} className={pill(tab === "unread")}>Unread</button>
            </div>
          </div>

          <div className="border-t border-slate-200 p-6">
            {error && <p className="mb-4 text-center text-red-600">{errMsg(error)}</p>}

            {!q.isLoading && !error && items.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 py-12 text-center text-slate-600">
                No notifications yet.
              </div>
            )}

            <ul className="space-y-3">
              {items.map((n) => {
                const who = n.sender ?? n.actor ?? n.user;
                const read = isRead(n);
                return (
                  <li key={n._id}>
                    <button onClick={() => !read && readOne.mutate(n._id)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        read ? "border-slate-200 bg-white hover:bg-slate-50" : "border-blue-100 bg-blue-50/60 hover:bg-blue-50"
                      }`}>
                      <Avatar name={who?.name} photo={who?.photo} size={48} />
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-800">
                          <span className="font-bold">{who?.name ?? "Someone"}</span> {describe(n)}
                        </p>
                        <p className="text-sm text-slate-500">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!read && <span className="h-3 w-3 shrink-0 rounded-full bg-blue-600" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            {q.isLoading && <p className="mt-4 text-center text-slate-500">Loading...</p>}

            {q.hasNextPage && (
              <div className="mt-5 text-center">
                <button onClick={() => q.fetchNextPage()} disabled={q.isFetchingNextPage}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-100">
                  {q.isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}