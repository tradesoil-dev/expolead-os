export default function StatCard({
  label,
  value,
  hint,
  accent = "ink",
}: {
  label: string;
  value: number | string;
  hint?: string;
  accent?: "ink" | "rose" | "amber" | "emerald";
}) {
  const bar =
  accent === "rose"
    ? "bg-rose-500"
    : accent === "amber"
    ? "bg-amber-500"
    : accent === "emerald"
    ? "bg-emerald-500"
    : "bg-ink-900";

  return (
    <div className="relative overflow-hidden rounded-xl border border-ink-200 bg-white p-5 shadow-card">
      <span className={`absolute left-0 top-0 h-full w-1 ${bar}`} />
      <p className="text-sm font-medium text-ink-500">{label}</p>
      <p className={`mt-2 font-semibold tracking-tight tabular-nums ${typeof value === "string" && value.length > 10 ? "text-lg leading-snug" : "text-3xl"}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
