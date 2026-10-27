import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SuppliersTable from "@/components/SuppliersTable";
import LockedButton from "@/components/LockedButton";
import { getSuppliers } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { ADD_BUTTON, ADD_BUTTON_LOCKED } from "@/lib/ui";

export default async function SuppliersPage() {
  const [suppliers, trial] = await Promise.all([getSuppliers(), getTrialStatus()]);

  return (
    <>
      <PageHeader
        title="Connections"
        subtitle="Everyone you've captured and saved"
        action={
          trial.isExpired ? (
            <LockedButton label="Add connection" className={ADD_BUTTON_LOCKED} />
          ) : (
            <Link href="/connections/new" className={ADD_BUTTON}>
              <span className="text-base leading-none">+</span> Add connection
            </Link>
          )
        }
      />
      <main className="flex-1 p-6 md:p-8">
        <SuppliersTable suppliers={suppliers} canExport={trial.canExport} canImport={!trial.isExpired} />
      </main>
    </>
  );
}
