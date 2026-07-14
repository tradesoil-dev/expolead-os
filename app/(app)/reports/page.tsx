import PageHeader from "@/components/PageHeader";
import ReportsView from "@/components/ReportsView";
import { getSuppliers, getOpportunities } from "@/lib/data";
import { getQuantityUnit } from "@/lib/quantity-unit";

export const metadata = { title: "Reports — ExpoLead OS" };

export default async function ReportsPage() {
  const [suppliers, opportunities, quantityUnit] = await Promise.all([getSuppliers(), getOpportunities(), getQuantityUnit()]);

  const connections = suppliers.map((s) => ({
    id: s.id,
    created_at: (s as any).created_at ?? null,
    interest_type: s.interest_type ?? null,
    exhibition: s.exhibition?.name ?? null,
  }));

  const opps = opportunities.map((o: any) => ({
    id: o.id,
    created_at: o.created_at ?? null,
    status: o.status ?? null,
    quantity: Number(o.quantity) || 0,
    quantity_unit: o.quantity_unit ?? null,
    exhibition: o.exhibition ?? null,
    next_follow_up_date: o.next_follow_up_date ?? null,
    next_follow_up_completed: o.next_follow_up_completed ?? null,
  }));

  return (
    <>
      <PageHeader title="Reports" subtitle="How your exhibitions are performing" />
      <main className="flex-1 p-6 md:p-8">
        <ReportsView connections={connections} opportunities={opps} quantityUnit={quantityUnit} />
      </main>
    </>
  );
}
