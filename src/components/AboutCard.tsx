const stats = [
  { value: "2012", label: "Founded" },
  { value: "40K+", label: "Graduates" },
  { value: "50+", label: "Partner Companies" },
  { value: "5", label: "Branches" },
  { value: "20", label: "Diplomas Available" },
];

export default function AboutCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-7 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand">
        About Route Academy
      </p>
      <h2 className="mt-3 text-2xl font-semibold">
        Egypt's Leading IT Training Center Since 2012
      </h2>
      <p className="mt-3 leading-8 text-slate-600">
        Route Academy is the premier IT training center in Egypt, established in
        2012. We specialize in delivering high-quality training courses in
        programming, web development, and application development. We've
        identified the unique challenges people may face when learning new
        technology and made efforts to provide strategies to overcome them.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ value, label }) => (
          <div key={label} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-xl font-bold text-brand">{value}</p>
            <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}