import { useEffect } from "react";
import { X, TriangleAlert } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open, title, message, confirmText = "Confirm", loading, onConfirm, onCancel,
}: Props) {
  // close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4"
      onMouseDown={onCancel}>
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h2 className="text-xl font-bold">Confirm action</h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start gap-4 border-b border-slate-200 px-6 py-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
            <TriangleAlert className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-slate-500">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
          <button onClick={onCancel}
            className="rounded-xl border border-slate-200 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="rounded-xl bg-rose-600 px-6 py-2.5 font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}