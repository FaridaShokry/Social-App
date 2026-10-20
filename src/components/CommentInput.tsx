import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Image as ImageIcon, Send, X } from "lucide-react";
import EmojiButton from "./EmojiButton";

type Props = {
  placeholder: string;
  onSubmit: (text: string, image: File | null) => Promise<void>;
  autoFocus?: boolean;
};

export default function CommentInput({ placeholder, onSubmit, autoFocus }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  const canSend = (text.trim() || image) && !sending;

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] ?? null);
    e.target.value = ""; // lets you pick the same file again
  };

  async function send() {
    if (!canSend) return;
    setError("");
    setSending(true);
    try {
      await onSubmit(text.trim(), image);
      setText("");
      setImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1">
      <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-4">
        <textarea
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none bg-transparent text-lg outline-none placeholder:text-slate-500"
        />

        {preview && (
          <div className="relative mt-2 w-fit">
            <img src={preview} alt="preview" className="max-h-40 rounded-xl" />
            <button type="button" onClick={() => setImage(null)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer text-slate-600 hover:text-brand" title="Photo">
              <ImageIcon className="h-6 w-6" />
              <input type="file" accept="image/*" hidden onChange={onFile} />
            </label>
            <EmojiButton onPick={(emoji) => setText((t) => t + emoji)} />
          </div>
          <button type="button" onClick={send} disabled={!canSend}
            className="grid h-12 w-12 place-items-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-40">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}