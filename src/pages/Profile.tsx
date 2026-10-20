import { useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Mail, Users, AtSign } from "lucide-react";
import Navbar from "../components/navbar";
import Avatar from "../components/Avatar";
import PostCard from "../components/PostCard";
import { getBookmarks, getProfile, getUserPosts, uploadPhoto } from "../api/users";
import { errMsg, getStoredUser } from "../utils";

const count = (n: unknown): number =>
  Array.isArray(n) ? n.length : typeof n === "number" ? n : 0;

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">{label}</p>
      <p className="mt-2 text-4xl font-extrabold">{value}</p>
    </div>
  );
}

type CardProps = { label: string; value: number; active: boolean; onClick: () => void };
function CountCard({ label, value, active, onClick }: CardProps) {
  return (
    <button onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        active ? "border-brand bg-blue-50" : "border-blue-100 bg-blue-50/50 hover:bg-blue-50"
      }`}>
      <p className="text-sm font-bold uppercase text-brand">{label}</p>
      <p className="mt-2 text-3xl font-extrabold">{value}</p>
    </button>
  );
}

export default function Profile() {
  const qc = useQueryClient();
  const stored = getStoredUser();
  const [cover, setCover] = useState<string | null>(null);
  const [tab, setTab] = useState<"posts" | "saved">("posts");

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const fresh = await getProfile();
      if (fresh) localStorage.setItem("user", JSON.stringify(fresh));
      return fresh;
    },
    placeholderData: stored ?? undefined, // show the login data instantly
  });
  const user = data ?? stored;

  const { data: posts = [] } = useQuery({
    queryKey: ["user-posts", user?._id],
    queryFn: () => getUserPosts(user!._id),
    enabled: !!user?._id,
  });

  const { data: saved = [] } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });

  const photo = useMutation({
    mutationFn: (file: File) => uploadPhoto(file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  function onCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCover(URL.createObjectURL(file)); // preview only, no cover endpoint
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) photo.mutate(file);
    e.target.value = "";
  }

  const coverImage = cover ?? user?.cover;
  const list = tab === "posts" ? posts : saved;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-6 py-6">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div
            className="relative h-80 bg-gradient-to-br from-slate-900 via-[#2a4a72] to-sky-400/80 bg-cover bg-center"
            style={coverImage ? { backgroundImage: `url(${coverImage})` } : undefined}
          >
            <label className="absolute right-5 top-5 flex cursor-pointer items-center gap-2 rounded-xl bg-slate-800/80 px-4 py-2.5 text-sm font-bold text-white backdrop-blur hover:bg-slate-800">
              <Camera className="h-4 w-4" /> Add cover
              <input type="file" accept="image/*" hidden onChange={onCover} />
            </label>
          </div>

          <div className="relative -mt-24 mx-6 rounded-3xl bg-white p-6 shadow-sm lg:mx-10 lg:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-end gap-5">
                <label className="group relative -mt-16 cursor-pointer rounded-full border-4 border-white bg-white shadow-lg ring-1 ring-slate-200">
                  <Avatar name={user?.name} photo={user?.photo} size={150} />
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-1">
                      <Camera className="h-4 w-4" /> {photo.isPending ? "Uploading..." : "Change"}
                    </span>
                  </span>
                  <input type="file" accept="image/*" hidden onChange={onPhoto} />
                </label>
                <div className="pb-2">
                  <h1 className="text-3xl font-extrabold">{user?.name ?? "Route Posts user"}</h1>
                  <p className="mt-1 flex items-center gap-1 text-lg text-slate-500">
                    <AtSign className="h-5 w-5" />
                    {user?.username ?? user?.email?.split("@")[0] ?? ""}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-semibold text-brand">
                    <Users className="h-4 w-4" /> Route Posts member
                  </span>
                  {photo.isError && <p className="mt-2 text-sm text-red-600">{errMsg(photo.error)}</p>}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 lg:w-[480px]">
                <Stat label="Followers" value={count(user?.followersCount ?? (user as any)?.followers)} />
                <Stat label="Following" value={count(user?.followingCount ?? (user as any)?.following)} />
                <Stat label="Bookmarks" value={saved.length} />
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 lg:grid-cols-[1fr_540px] lg:p-10">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <h2 className="text-lg font-bold">About</h2>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-500" /> {user?.email ?? "No email"}
                </li>
                <li className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-500" /> Active on Route Posts
                </li>
                {user?.gender && (
                  <li className="flex items-center gap-3 capitalize">
                    <Users className="h-5 w-5 text-slate-500" /> {user.gender}
                  </li>
                )}
                {user?.dateOfBirth && (
                  <li className="flex items-center gap-3">
                     {new Date(user.dateOfBirth).toLocaleDateString()}
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <CountCard label="My posts" value={posts.length} active={tab === "posts"} onClick={() => setTab("posts")} />
              <CountCard label="Saved posts" value={saved.length} active={tab === "saved"} onClick={() => setTab("saved")} />
            </div>
          </div>

          <div className="space-y-6 bg-slate-50/60 p-6 lg:p-10">
            <h2 className="text-2xl font-bold">{tab === "posts" ? "My Posts" : "Saved Posts"}</h2>

            {list.length === 0 && (
              <div className="rounded-3xl bg-white p-12 text-center text-slate-500">
                {tab === "posts" ? "You haven't posted anything yet." : "No saved posts yet."}
              </div>
            )}

            {list.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}