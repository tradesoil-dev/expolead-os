import PageHeader from "@/components/PageHeader";
import ReportsView from "@/components/ReportsView";
import { getSuppliers, getOpportunities, getExhibitions } from "@/lib/data";
import { getQuantityUnit } from "@/lib/quantity-unit";
import { getCurrency } from "@/lib/currency";

export const metadata = { title: "Reports — ExpoLead OS" };

export default async function ReportsPage() {
  const [suppliers, opportunities, exhibitions, quantityUnit, currency] = await Promise.all([
    getSuppliers(),
    getOpportunities(),
    getExhibitions(),
    getQuantityUnit(),
    getCurrency(),
  ]);

  const exhibitionCosts = exhibitions.map((e: any) => ({ name: e.name, cost: e.cost ?? null }));

  const connections = suppliers.map((s) => ({
    id: s.id,
    created_at: (s as any).created_at ?? null,
    interest_type: s.interest_type ?? null,
    exhibition: s.exhibition?.name ?? null,
    country: s.country ?? null,
  }));

  const opps = opportunities.map((o: any) => ({
    id: o.id,
    created_at: o.created_at ?? null,
    status: o.status ?? null,
    quantity: Number(o.quantity) || 0,
    quantity_unit: o.quantity_unit ?? null,
    deal_value: o.deal_value ?? null,
    exhibition: o.exhibition ?? null,
    market: o.destination_market ?? null,
    next_follow_up_date: o.next_follow_up_date ?? null,
    next_follow_up_completed: o.next_follow_up_completed ?? null,
  }));

  return (
    <>
      <PageHeader title="Reports" subtitle="How your exhibitions are performing" />
      <main className="flex-1 p-6 md:p-8">
        <ReportsView connections={connections} opportunities={opps} quantityUnit={quantityUnit} currency={currency} exhibitionCosts={exhibitionCosts} />
      </main>
    </>
  );
}
