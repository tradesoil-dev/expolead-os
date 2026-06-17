import PageHeader from "@/components/PageHeader";
import AddExhibitionForm from "@/components/AddExhibitionForm";
import ExhibitionsSearch from "@/components/ExhibitionsSearch";
import { getExhibitions, getSuppliers } from "@/lib/data";

export default async function ExhibitionsPage() {
  const [exhibitions, suppliers] = await Promise.all([getExhibitions(), getSuppliers()]);

  return (
    <>
      <PageHeader title="Exhibitions" subtitle="The shows you attend" />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <AddExhibitionForm />
        <ExhibitionsSearch exhibitions={exhibitions} suppliers={suppliers} />
      </main>
    </>
  );
}
