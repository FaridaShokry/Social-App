import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import type { EmojiClickData } from "emoji-picker-react";

type Props = { onPick: (emoji: string) => void };

export default function EmojiButton({ onPick }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="text-slate-600 hover:text-brand" title="Emoji">
        <Smile className="h-6 w-6" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-3 rounded-2xl shadow-xl">
          <EmojiPicker
            onEmojiClick={(d: EmojiClickData) => onPick(d.emoji)}
            emojiStyle={EmojiStyle.NATIVE}
            width={340}
            height={400}
            lazyLoadEmojis
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}