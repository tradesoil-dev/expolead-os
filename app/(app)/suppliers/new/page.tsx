import PageHeader from "@/components/PageHeader";
import SupplierForm from "@/components/SupplierForm";
import { getExhibitions } from "@/lib/data";

export default async function NewSupplierPage() {
  const exhibitions = await getExhibitions();
  return (
    <>
      <PageHeader title="Add supplier" subtitle="Capture a company you met or want to target" />
      <main className="flex-1 p-6 md:p-8">
        <SupplierForm exhibitions={exhibitions} />
      </main>
    </>
  );
}
