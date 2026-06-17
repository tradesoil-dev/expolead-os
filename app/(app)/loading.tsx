export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <svg className="h-8 w-8 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink-900">Loading ExpoLead OS</p>
        <p className="text-xs text-ink-400 mt-1">Preparing your workspace…</p>
      </div>
    </div>
  );
}
