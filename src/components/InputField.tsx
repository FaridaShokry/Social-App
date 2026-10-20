import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon;
  error?: string;
  children?: ReactNode; // pass a <select> instead of an <input>
};

const InputField = forwardRef<HTMLInputElement, Props>(
  ({ icon: Icon, error, children, ...props }, ref) => (
    <div>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        {children ?? (
          <input
            ref={ref}
            {...props}
            className={`h-14 w-full rounded-xl border bg-slate-50 pl-12 pr-4 text-slate-800
              placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-brand focus:ring-brand/20"
              }`}
          />
        )}
      </div>
      {error && <p className="mt-1 px-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);

export default InputField;