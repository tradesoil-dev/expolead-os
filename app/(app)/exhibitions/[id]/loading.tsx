// Shown instantly on navigation to an exhibition while its data loads, so the
// app doesn't sit on the previous page. Mirrors the detail page's layout:
// back link, header, four stat cards, and the two-column body.
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="px-6 md:px-8 pt-6">
        <div className="h-4 w-40 rounded bg-slate-200" />
      </div>

      <div className="px-6 md:px-8 pt-4 pb-2">
        <div className="h-7 w-64 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-200" />
      </div>

      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mx-auto h-8 w-16 rounded bg-slate-200" />
              <div className="mx-auto mt-2 h-4 w-28 rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-lg bg-slate-100" />
              <div className="h-20 rounded-lg bg-slate-100" />
            </div>
            <div className="h-9 w-24 rounded bg-slate-200" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="h-5 w-44 rounded bg-slate-200" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 w-full rounded bg-slate-100" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
