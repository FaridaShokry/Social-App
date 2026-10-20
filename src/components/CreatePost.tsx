import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Smile, Send, X } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";
import Avatar from "./Avatar";
import { createPost } from "../api/posts";
import { errMsg, getStoredUser } from "../utils";

export default function CreatePost() {
  const user = getStoredUser();
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [image, setImage] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerWrapRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const publish = useMutation({
    mutationFn: (form: FormData) => createPost(form),
    onSuccess: () => {
      setBody("");
      setImage(null);
      setShowPicker(false);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (pickerWrapRef.current && !pickerWrapRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function onEmojiClick(emojiData: EmojiClickData) {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    setBody(body.slice(0, start) + emojiData.emoji + body.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emojiData.emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] ?? null);
    e.target.value = "";
  };

  const canPost = (body.trim() || image) && !publish.isPending;

  function submit() {
    const form = new FormData();
    if (body.trim()) form.append("body", body.trim()); // optional: image-only posts work
    form.append("privacy", privacy);
    if (image) form.append("image", image);
    publish.mutate(form);
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Avatar name={user?.name} photo={user?.photo} size={52} />
        <div>
          <p className="text-lg font-bold">{user?.name}</p>
          <select value={privacy} onChange={(e) => setPrivacy(e.target.value)}
            className="mt-1 rounded-full bg-slate-100 px-3 py-1 text-sm outline-none">
            <option value="public">🌐 Public</option>
            <option value="following">👥 Followers</option>
            <option value="only me">🔒 Only me</option>
          </select>
        </div>
      </div>

      <textarea ref={textareaRef} value={body} onChange={(e) => setBody(e.target.value)}
        placeholder={`What's on your mind, ${user?.name?.split(" ")[0] ?? ""}?`}
        className="mt-4 h-40 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-lg outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />

      {image && (
        <div className="relative mt-3 w-fit">
          <img src={URL.createObjectURL(image)} alt="preview" className="max-h-60 rounded-xl" />
          <button onClick={() => setImage(null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {publish.isError && <p className="mt-2 text-sm text-red-600">{errMsg(publish.error)}</p>}

      <div className="mt-4 flex items-center justify-between border-t border-slate-300 pt-4">
        <div className="flex gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-slate-700 hover:text-brand">
            <ImageIcon className="h-5 w-5 text-emerald-600" /> Photo/video
            <input type="file" accept="image/*" hidden onChange={onFile} />
          </label>

          <div ref={pickerWrapRef} className="relative">
            <button type="button" onClick={() => setShowPicker((v) => !v)}
              className="flex items-center gap-2 text-slate-700 hover:text-brand">
              <Smile className="h-5 w-5 text-amber-500" /> Feeling/activity
            </button>
            {showPicker && (
              <div className="absolute left-0 top-full z-30 mt-3 rounded-2xl shadow-xl">
                <EmojiPicker onEmojiClick={onEmojiClick} emojiStyle={EmojiStyle.NATIVE}
                  width={440} height={500} lazyLoadEmojis previewConfig={{ showPreview: false }} />
              </div>
            )}
          </div>
        </div>

        <button onClick={submit} disabled={!canPost}
          className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50">
          {publish.isPending ? "Posting..." : "Post"} <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}