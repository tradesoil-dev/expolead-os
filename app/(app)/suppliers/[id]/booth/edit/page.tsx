import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BoothManager from "@/components/BoothManager";
import { getSupplier, getExhibitions } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function EditBoothPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [supplier, exhibitions] = await Promise.all([
    getSupplier(id),
    getExhibitions(),
  ]);

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
      <PageHeader
        title="Edit Booth Information"
        subtitle={supplier.company_name}
      />

      <main className="flex-1 p-6 md:p-8">
        <BoothManager
          supplierId={supplier.id}
          exhibitions={exhibitions}
          initialData={{
            exhibition_id: supplier.exhibition_id,
            hall: supplier.hall,
            booth_number: supplier.booth_number,
            stand_location: supplier.stand_location,
            visited: supplier.visited,
            visit_date: supplier.visit_date,
          }}
        />
      </main>
    </>
  );
}