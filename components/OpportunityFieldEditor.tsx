"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OPPORTUNITY_STATUSES, type Opportunity } from "@/lib/types";
import Select from "./Select";
import { QUANTITY_UNITS } from "@/lib/quantity-units";

const PRIORITY_OPTIONS: { value: Opportunity["priority"]; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

async function updateOpportunity(
  opportunityId: string,
  field: string,
  value: string
) {
  const supabase = createClient();
  // deal_value is numeric in the database; an empty box means "not recorded",
  // which must be null rather than 0 so it does not drag the ROI figure down.
  const payload = field === "deal_value" ? (value.trim() === "" ? null : Number(value)) : value;
  return supabase.from("opportunities").update({ [field]: payload }).eq("id", opportunityId);
}

export function OpportunityStatusEditor({
  opportunityId,
  current,
}: {
  opportunityId: string;
  current: Opportunity["status"];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: Opportunity["status"]) {
    const previous = value;
    setValue(next);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("opportunities")
      .update({ status: next })
      .eq("id", opportunityId);

    if (error) {
      setValue(previous);
      setError(error.message);
      return;
    }

    await supabase
      .from("opportunity_status_history")
      .insert({ opportunity_id: opportunityId, status: next });

    router.refresh();
  }

  return (
    <div>
      <Select
        value={value}
        onChange={(v) => handleChange(v as Opportunity["status"])}
        options={OPPORTUNITY_STATUSES.map((opt) => ({ value: opt.value, label: opt.label }))}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function OpportunityPriorityEditor({
  opportunityId,
  current,
}: {
  opportunityId: string;
  current: Opportunity["priority"];
}) {
  const router = useRouter();
  const [value, setValue] = useState(current);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: Opportunity["priority"]) {
    const previous = value;
    setValue(next);
    setError(null);

    const { error } = await updateOpportunity(opportunityId, "priority", next);
    if (error) {
      setValue(previous);
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Select
        value={value}
        onChange={(v) => handleChange(v as Opportunity["priority"])}
        options={PRIORITY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function OpportunityUnitEditor({
  opportunityId,
  current,
  workspaceDefault,
}: {
  opportunityId: string;
  current: string | null;
  workspaceDefault: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current || workspaceDefault);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(next: string) {
    const previous = value;
    setValue(next);
    setError(null);
    const { error } = await updateOpportunity(opportunityId, "quantity_unit", next);
    if (error) {
      setValue(previous);
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Select
        value={value}
        onChange={handleChange}
        options={QUANTITY_UNITS.map((u) => ({ value: u.value, label: u.value }))}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

export function OpportunityTextFieldEditor({
  opportunityId,
  field,
  current,
}: {
  opportunityId: string;
  field: "quantity" | "destination_market" | "deal_value";
  current: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(current ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleBlur() {
    if (value === (current ?? "")) return;
    setError(null);

    const previous = current ?? "";
    const { error } = await updateOpportunity(opportunityId, field, value);
    if (error) {
      setValue(previous);
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        className="w-full rounded-lg border border-ink-200 bg-white px-2 py-2.5 text-sm font-semibold outline-none focus:border-brand-500"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
