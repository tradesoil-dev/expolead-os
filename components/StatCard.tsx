export default function StatCard({
  label,
  value,
  hint,
  accent = "ink",
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "ink" | "rose" | "amber" | "emerald";
  icon?: React.ReactNode;
}) {
  const bar =
  accent === "rose"
    ? "bg-rose-500"
    : accent === "amber"
    ? "bg-amber-500"
    : accent === "emerald"
    ? "bg-emerald-500"
    : "bg-ink-900";

  const iconTint =
    accent === "rose"
      ? "bg-rose-50 text-rose-600"
      : accent === "amber"
      ? "bg-amber-50 text-amber-600"
      : accent === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-ink-100 text-ink-500";

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {icon && <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconTint}`}>{icon}</span>}
      </div>
      <p className={`mt-2 font-semibold tracking-tight tabular-nums ${typeof value === "string" && value.length > 10 ? "text-lg leading-snug" : "text-3xl"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
