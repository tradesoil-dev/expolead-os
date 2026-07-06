import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { PriorityBadge, InterestBadge } from "@/components/Badge";
import StatusUpdater from "@/components/StatusUpdater";
import ClassificationUpdater from "@/components/ClassificationUpdater";
import AddContactForm from "@/components/AddContactForm";
import ContactManager from "@/components/ContactManager";

import AddMeetingForm from "@/components/AddMeetingForm";
import AddProductForm from "@/components/AddProductForm";
import { getSupplier, getExhibitions } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import DeleteConnectionButton from "@/components/DeleteConnectionButton";

export default async function SupplierProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supplier, exhibitions] = await Promise.all([getSupplier(id), getExhibitions()]);

  if (!supplier) {
    if (!isSupabaseConfigured) {
      return (
        <main className="flex-1 grid place-items-center p-8 text-center">
          <p className="text-sm text-ink-500">Connect Supabase to view saved companies.</p>
        </main>
      );
    }
    notFound();
  }

  const contacts = supplier.contacts ?? [];
  const meetings = [...(supplier.meetings ?? [])].sort((a, b) =>
    a.met_on < b.met_on ? 1 : -1
  );

  return (
    <>
      <PageHeader
        title={supplier.company_name}
        subtitle={supplier.country ?? "—"}
        action={
          <div className="flex items-center gap-3">
            <Link href="/suppliers" className="text-sm font-medium text-ink-500 hover:text-ink-900">
              ← Back
            </Link>
            <DeleteConnectionButton supplierId={supplier.id} />
          </div>
        }
      />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-3xl">
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <InterestBadge interest={supplier.interest_type} />
            <PriorityBadge priority={supplier.priority} />
            {supplier.is_target && (
              <span className="rounded bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-500">Target</span>
            )}
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="Website">
              {supplier.website ? (
                <a href={supplier.website} target="_blank" rel="noreferrer" className="text-brand-600 hover:text-brand-700 break-all">
                  {supplier.website}
                </a>
              ) : "—"}
            </Row>
            <Row label="Exhibition">{supplier.exhibition?.name ?? "—"}</Row>
            <Row label="Follow-up date">{supplier.follow_up_date ?? "—"}</Row>
          </dl>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-ink-100">
            <div>
              <p className="text-xs text-ink-400 mb-1">Classification</p>
              <ClassificationUpdater supplierId={supplier.id} current={supplier.interest_type} />
            </div>
            <div>
              <p className="text-xs text-ink-400 mb-1">Follow-up status</p>
              <StatusUpdater supplierId={supplier.id} current={supplier.follow_up_status} />
            </div>
          </div>
        </div>

                <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
  <h2 className="text-sm font-semibold">Booth & Exhibition</h2>

  <Link
    href={`/suppliers/${supplier.id}/booth/edit`}
    className="text-sm text-blue-600 hover:underline"
  >
    Edit
  </Link>
</div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="Source exhibition">
              {supplier.exhibition?.name ?? "—"}
            </Row>

            <Row label="Hall">
              {supplier.hall ?? "—"}
            </Row>

            <Row label="Booth number">
              {supplier.booth_number ?? "—"}
            </Row>

            <Row label="Stand location">
              {supplier.stand_location ?? "—"}
            </Row>

            <Row label="Visited">
              {supplier.visited ? "Yes" : "No"}
            </Row>

            <Row label="Visit date">
              {supplier.visit_date ?? "—"}
            </Row>
          </dl>
        </div>
        
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
          <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
  <div className="flex items-center justify-between gap-4">
  <h2 className="text-sm font-semibold">Products Discussed</h2>
  <AddProductForm supplierId={supplier.id} />
</div>

  {!supplier.products || supplier.products.length === 0 ? (
    <p className="text-sm text-ink-400">No products added yet.</p>
  ) : (
    <ul className="space-y-3">
      {supplier.products.map((p) => (
        <li key={p.id} className="rounded-lg border border-ink-100 p-3">
          <p className="font-medium">{p.name}</p>

          {p.application && (
            <p className="text-sm text-ink-500 mt-1">
              {p.application}
            </p>
          )}

          {p.certifications.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {p.certifications.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-ink-100 px-2 py-1 text-xs"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )}
</div>
  <h2 className="text-sm font-semibold">Activity Timeline</h2>

  <div className="space-y-3 text-sm">
    <div>
      <p className="font-medium">✓ Connection Added</p>
      <p className="text-ink-400">Company profile created</p>
    </div>

    {supplier.visited && (
      <div>
        <p className="font-medium">✓ Booth Visited</p>
        <p className="text-ink-400">
          {supplier.visit_date ?? "Visit date not recorded"}
        </p>
      </div>
    )}

    {contacts.length > 0 && (
      <div>
        <p className="font-medium">✓ Contact Captured</p>
        <p className="text-ink-400">
          {contacts.length} contact{contacts.length === 1 ? "" : "s"} saved
        </p>
      </div>
    )}

    {meetings.length > 0 && (
      <div>
        <p className="font-medium">✓ Meeting Logged</p>
        <p className="text-ink-400">
          {meetings.length} meeting{meetings.length === 1 ? "" : "s"} recorded
        </p>
      </div>
    )}

    {supplier.follow_up_date && (
      <div>
        <p className="font-medium">⏳ Follow-up Scheduled</p>
        <p className="text-ink-400">{supplier.follow_up_date}</p>
      </div>
    )}
  </div>
</div>
        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold">Meetings</h2>
            <AddMeetingForm supplierId={supplier.id} exhibitions={exhibitions} />
          </div>

          {meetings.length === 0 ? (
            <p className="text-sm text-ink-400">No meetings logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {meetings.map((mt) => (
                <li key={mt.id} className="rounded-lg border border-ink-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{mt.met_on}</span>
                    {mt.exhibition?.name && (
                      <span className="text-xs text-ink-500">{mt.exhibition.name}</span>
                    )}
                  </div>
                  {mt.notes && <p className="text-sm text-ink-700 mt-1 whitespace-pre-wrap">{mt.notes}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Contacts</h2>
            <AddContactForm supplierId={supplier.id} />
          </div>

          {contacts.length === 0 ? (
            <p className="text-sm text-ink-400">No contacts yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {contacts.map((ct) => (
                <ContactManager key={ct.id} contact={ct} />
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-ink-200 bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-2">Notes</h2>
          <p className="text-sm text-ink-700 whitespace-pre-wrap">
            {supplier.notes?.trim() ? supplier.notes : <span className="text-ink-400">No notes.</span>}
          </p>
        </div>
      </main>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-ink-400 text-xs">{label}</dt>
      <dd className="text-ink-900 mt-0.5">{children}</dd>
    </div>
  );
}