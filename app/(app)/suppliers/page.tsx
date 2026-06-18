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
            <LockedButton label="Add connection" className="inline-flex items-center gap-1.5 rounded-lg bg-ink-100 px-3.5 py-2 text-sm font-medium text-ink-400" />
          ) : (
            <Link
              href="/suppliers/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm px-3.5 py-2 text-sm font-medium text-white transition-colors"
            >
              <span className="text-base leading-none">+</span> Add connection
            </Link>
          )
        }
      />
      <main className="flex-1 p-6 md:p-8">
        <SuppliersTable suppliers={suppliers} />
      </main>
    </>
  );
}
