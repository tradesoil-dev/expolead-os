import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import SuppliersTable from "@/components/SuppliersTable";
import { getSuppliers } from "@/lib/data";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <>
      <PageHeader
        title="Suppliers"
        subtitle="Everyone you've captured and saved"
        action={
          <Link
            href="/suppliers/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-sm px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-700 transition-colors"
          >
            <span className="text-base leading-none">+</span> Add supplier
          </Link>
        }
      />
      <main className="flex-1 p-6 md:p-8">
        <SuppliersTable suppliers={suppliers} />
      </main>
    </>
  );
}
