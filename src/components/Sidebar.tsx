import { Newspaper, Sparkles, Globe, Bookmark } from "lucide-react";

const items = [
  { label: "Feed", icon: Newspaper },
  { label: "My Posts", icon: Sparkles },
  { label: "Community", icon: Globe },
  { label: "Saved", icon: Bookmark },
];

type Props = { active: string; onSelect: (label: string) => void };

export default function Sidebar({ active, onSelect }: Props) {
  return (
    <aside className="rounded-3xl bg-white p-4 shadow-sm space-y-1 h-fit sticky top-28">
      {items.map(({ label, icon: Icon }) => (
        <button key={label} onClick={() => onSelect(label)}
          className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
            active === label ? "bg-blue-50 text-brand" : "text-slate-800 hover:bg-slate-50"
          }`}>
          <Icon className="h-5 w-5" /> {label}
        </button>
      ))}
    </aside>
  );
}