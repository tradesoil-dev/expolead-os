import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SuppliersTable from "@/components/SuppliersTable";
import LockedButton from "@/components/LockedButton";
import { getSuppliers } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";

export default async function SuppliersPage() {
  const [suppliers, trial] = await Promise.all([getSuppliers(), getTrialStatus()]);

  return (
    <>
      <PageHeader
        title="Connections"
        subtitle="Everyone you've captured and saved"
        action={
          trial.isExpired ? (
            <div className="flex items-center gap-2">
              <LockedButton label="Import" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-400" />
              <LockedButton label="Add connection" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/connections/import"
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
              >
                Import
              </Link>
              <Link
                href="/connections/new"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm px-3.5 py-2 text-sm font-medium text-white transition-colors"
              >
                <span className="text-base leading-none">+</span> Add connection
              </Link>
            </div>
          )
        }
      />
      <main className="flex-1 p-6 md:p-8">
        <SuppliersTable suppliers={suppliers} canExport={trial.canExport} />
      </main>
    </>
  );
}
