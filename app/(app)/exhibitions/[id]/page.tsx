import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { getExhibitions, getSuppliers, getMeetingsForExhibition } from "@/lib/data";

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const { id } = await params;
  const exhibitions = await getExhibitions();
const exhibition = exhibitions.find((ex) => ex.id === id);

  if (!exhibition) {
    notFound();
  }

  const suppliers = (await getSuppliers()).filter(
    (s) => s.exhibition_id === exhibition.id
  );

  const meetings = await getMeetingsForExhibition(exhibition.id);

  const visited = suppliers.filter((s) => s.visited).length;
  const remaining = suppliers.length - visited;

  const followUpsScheduled = suppliers.filter(
    (s) => s.follow_up_date && s.follow_up_status !== "closed"
  ).length;

  return (
    <>
      <div className="px-6 md:px-8 pt-6">
        <Link href="/exhibitions" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
          ← Back to Exhibitions
        </Link>
      </div>
      <PageHeader
        title={exhibition.name}
        subtitle={exhibition.location ?? "Exhibition"}
      />

      <main className="flex-1 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border-2 border-emerald-400 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{suppliers.length}</p>
            <p className="text-sm text-ink-500">Connections Captured</p>
          </div>

          <div className="rounded-xl border-2 border-blue-400 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{visited}</p>
            <p className="text-sm text-ink-500">Booths Visited</p>
          </div>

          <div className="rounded-xl border-2 border-amber-400 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{remaining}</p>
            <p className="text-sm text-ink-500">Remaining Booths</p>
          </div>

          <div className="rounded-xl border-2 border-purple-400 bg-white p-4 text-center">
            <p className="text-sm font-semibold text-ink-400">Not tracked yet</p>
            <p className="text-sm text-ink-500">Opportunities</p>
          </div>
        </div>
<div className="grid gap-4 lg:grid-cols-4">
  <div className="rounded-xl border border-ink-200 bg-white p-4">
    <h3 className="font-semibold">Meetings</h3>
    <p className="mt-2 text-sm text-ink-500">
  {meetings.length === 0
    ? "No meetings recorded."
    : `${meetings.length} meeting${meetings.length === 1 ? "" : "s"} recorded.`}
</p>
  </div>

  <div className="rounded-xl border border-ink-200 bg-white p-4">
    <h3 className="font-semibold">Exhibition Intelligence</h3>
    <div className="mt-3 space-y-2 text-sm">
  <div className="flex justify-between">
    <span className="text-ink-500">Connections</span>
    <span className="font-medium">{suppliers.length}</span>
  </div>

  <div className="flex justify-between">
    <span className="text-ink-500">Visited</span>
    <span className="font-medium">{visited}</span>
  </div>

  <div className="flex justify-between">
    <span className="text-ink-500">Remaining</span>
    <span className="font-medium">{remaining}</span>
  </div>

  <div className="mt-1 border-t border-ink-100 pt-2">
    <p className="text-ink-500">Location</p>
    <p className="mt-0.5 font-medium leading-snug">
      {exhibition.location ?? "-"}
    </p>
  </div>
</div>
    
  </div>

  <div className="rounded-xl border border-ink-200 bg-white p-4">
    <h3 className="font-semibold">Follow-ups</h3>
    <p className="mt-2 text-sm text-ink-500">
      {followUpsScheduled === 0
        ? "No follow-ups scheduled."
        : `${followUpsScheduled} follow-up${followUpsScheduled === 1 ? "" : "s"} scheduled.`}
    </p>
  </div>

  <div className="rounded-xl border border-ink-200 bg-white p-4">
    <h3 className="font-semibold">Revenue Pipeline</h3>
    <p className="mt-2 text-sm text-ink-500">
      Not tracked yet — opportunities aren't linked to exhibitions.
    </p>
  </div>
</div>
        <div className="rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-100 px-4 py-3">
            <h2 className="font-semibold">Connections at this Exhibition</h2>
          </div>

          {suppliers.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">
              No connections linked to this exhibition yet.
            </p>
          ) : (
            <div className="divide-y divide-ink-100">
              {suppliers.map((supplier) => (
                <Link
                  key={supplier.id}
                  href={`/suppliers/${supplier.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-ink-50"
                >
                  <div>
                    <p className="font-medium">{supplier.company_name}</p>

                    <p className="text-sm text-ink-500">
                      Hall: {supplier.hall ?? "-"} | Booth: {supplier.booth_number ?? "-"}
                    </p>
                  </div>

                  {supplier.visited ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      Visited
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                      Pending
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}