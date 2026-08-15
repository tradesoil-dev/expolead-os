import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import CompanyManager from "@/components/CompanyManager";
import { getSupplier } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplier(id);

  if (!supplier) {
    if (!isSupabaseConfigured) {
      return (
        <main className="flex-1 grid place-items-center p-8 text-center">
          <p className="text-sm text-ink-500">
            Connect Supabase to view saved companies.
          </p>
        </main>
      );
    }

    notFound();
  }

  return (
    <>
      <PageHeader title="Edit company details" subtitle={supplier.company_name} />

      <main className="flex-1 p-6 md:p-8">
        <CompanyManager
          supplierId={supplier.id}
          initialData={{
            company_name: supplier.company_name,
            country: supplier.country,
            website: supplier.website,
            priority: supplier.priority,
            follow_up_date: supplier.follow_up_date,
            is_target: supplier.is_target,
          }}
        />
      </main>
    </>
  );
}
