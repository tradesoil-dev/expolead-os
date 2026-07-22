import PageHeader from "@/components/PageHeader";
import AddExhibitionForm from "@/components/AddExhibitionForm";
import ExhibitionsSearch from "@/components/ExhibitionsSearch";
import { getExhibitions, getSuppliers, getExhibitionLibrary } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { getCurrency } from "@/lib/currency";

export default async function ExhibitionsPage() {
  const [exhibitions, suppliers, library, trial, currency] = await Promise.all([
    getExhibitions(),
    getSuppliers(),
    getExhibitionLibrary(),
    getTrialStatus(),
    getCurrency(),
  ]);

  return (
    <>
      <PageHeader title="Exhibitions" subtitle="The shows you attend" />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <AddExhibitionForm isLocked={trial.isExpired} library={library} currency={currency} />
        <ExhibitionsSearch exhibitions={exhibitions} suppliers={suppliers} />
      </main>
    </>
  );
}
