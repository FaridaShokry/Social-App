import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../components/navbar";
import Sidebar from "../components/Sidebar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import SuggestedFriends from "../components/SuggestedFriends";
import { extractPosts, getAllPosts, getFeed } from "../api/posts";
import { errMsg } from "../utils";

export default function Feed() {
  const [tab, setTab] = useState("Feed");

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["posts", tab],
    // "Feed" = people you follow, "Community" = everyone
    queryFn: async () => extractPosts(tab === "Community" ? await getAllPosts() : await getFeed(10)),
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto grid max-w-[1500px] gap-6 px-6 py-8 lg:grid-cols-[260px_1fr_340px]">
        <Sidebar active={tab} onSelect={setTab} />

        <div className="space-y-6">
          <CreatePost />

          {isLoading && <p className="text-center text-slate-500">Loading posts...</p>}
          {error && <p className="text-center text-red-600">{errMsg(error)}</p>}

          {!isLoading && !error && posts.length === 0 && (
            <div className="rounded-3xl bg-white p-14 text-center text-lg text-slate-500 shadow-sm">
              No posts yet. Be the first one to publish.
            </div>
          )}

          {posts.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>

        <SuggestedFriends />
      </main>
    </div>
  );
}