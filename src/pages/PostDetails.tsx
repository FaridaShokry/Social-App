import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Navbar from "../components/navbar";
import PostCard from "../components/PostCard";
import { getPost } from "../api/posts";
import { errMsg } from "../utils";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-6">
        <button onClick={() => navigate(-1)}
          className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50">
          <ArrowLeft className="h-5 w-5" /> Back
        </button>

        {isLoading && <p className="text-center text-slate-500">Loading...</p>}
        {error && <p className="text-center text-red-600">{errMsg(error)}</p>}
        {!isLoading && !error && !post && <p className="text-center text-red-600">Post not found</p>}

        {post && <PostCard post={post} startOpen onDeleted={() => navigate("/")} />}
      </main>
    </div>
  );
}