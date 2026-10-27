// Small "↑ 59%" / "↓ 6 pts" chip comparing a number with the previous period.
// goodWhenUp=false flips the colours for numbers where lower is better
// (e.g. cost per connection). Renders nothing when there is no comparison.

export function pctChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DeltaChip({
  value,
  unit = "%",
  goodWhenUp = true,
  suffix,
}: {
  value: number | null | undefined;
  unit?: "%" | " pts" | "";
  goodWhenUp?: boolean;
  suffix?: string;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const up = value > 0;
  const flat = value === 0;
  const good = flat ? null : up === goodWhenUp;
  const cls =
    good === null
      ? "bg-slate-100 text-slate-600"
      : good
        ? "bg-emerald-50 text-emerald-700"
        : "bg-rose-50 text-rose-600";
  return (
    <span className={`inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${cls}`}>
      {!flat && (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {up ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
        </svg>
      )}
      {Math.abs(value)}
      {unit}
      {suffix ? ` ${suffix}` : ""}
    </span>
  );
}
