"use client";

import { useState } from "react";
import AddOpportunityForm from "@/components/AddOpportunityForm";
import ExhibitionFilter from "@/components/ExhibitionFilter";
import type { Exhibition } from "@/lib/types";

type ConnOption = { id: string; company_name: string; exhibition_name: string | null; booth_number: string | null };

// Groups the "New Opportunity" form and the list's exhibition filter so the
// filter can hide while the form is open (it only applies to the list).
export default function OpportunitiesToolbar({
  exhibitions,
  connections,
  isLocked,
  quantityUnit,
  currency,
  exhibitionNames,
  selected,
}: {
  exhibitions: Exhibition[];
  connections: ConnOption[];
  isLocked?: boolean;
  quantityUnit?: string;
  currency?: string;
  exhibitionNames: string[];
  selected: string;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <AddOpportunityForm
        exhibitions={exhibitions}
        connections={connections}
        isLocked={isLocked}
        quantityUnit={quantityUnit}
        currency={currency}
        onOpenChange={setAdding}
      />
      {!adding && exhibitionNames.length > 1 && (
        <ExhibitionFilter exhibitions={exhibitionNames} value={selected} />
      )}
    </div>
  );
}
