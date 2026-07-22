import PageHeader from "@/components/PageHeader";
import AddExhibitionForm from "@/components/AddExhibitionForm";
import ExhibitionsSearch from "@/components/ExhibitionsSearch";
import { getExhibitions, getSuppliers, getExhibitionLibrary, getOpportunities } from "@/lib/data";
import { getTrialStatus } from "@/lib/trial";
import { getCurrency } from "@/lib/currency";

export default async function ExhibitionsPage() {
  const [exhibitions, suppliers, library, trial, currency, opportunities] = await Promise.all([
    getExhibitions(),
    getSuppliers(),
    getExhibitionLibrary(),
    getTrialStatus(),
    getCurrency(),
    getOpportunities(),
  ]);

  return (
    <>
      <PageHeader title="Exhibitions" subtitle="The shows you attend" />
      <main className="flex-1 p-6 md:p-8 space-y-6">
        <AddExhibitionForm isLocked={trial.isExpired} library={library} currency={currency} />
        <ExhibitionsSearch exhibitions={exhibitions} suppliers={suppliers} opportunities={opportunities.map((o: any) => ({ exhibition: o.exhibition ?? null, status: o.status ?? null, deal_value: o.deal_value ?? null }))} currency={currency} />
      </main>
    </>
  );
}
