import { createClient } from "@/lib/supabase/server";
import { PLAN_PRICES, type PlanId, type BillingCycle } from "@/lib/plans";

// Admin-editable pricing, read server-side from the plan_pricing table
// (migration 0046). Falls back to the hardcoded defaults in lib/plans if the
// table is missing (e.g. before the migration is applied) so nothing breaks.
// The charged amount is always derived here, never trusted from the browser.

export type PlanPricing = {
  monthly: number;
  annual: number;
  introEnabled: boolean;
  introMonthly: number;
  introMonths: number;
  introLabel: string | null;
};

export type Pricing = Record<PlanId, PlanPricing>;

const DEFAULTS: Pricing = {
  starter: {
    monthly: PLAN_PRICES.starter.monthly,
    annual: PLAN_PRICES.starter.annual,
    introEnabled: false,
    introMonthly: 0,
    introMonths: 1,
    introLabel: null,
  },
  growth: {
    monthly: PLAN_PRICES.growth.monthly,
    annual: PLAN_PRICES.growth.annual,
    introEnabled: false,
    introMonthly: 0,
    introMonths: 1,
    introLabel: null,
  },
};

type Row = {
  plan: string;
  monthly_usd: number;
  annual_usd: number;
  intro_enabled: boolean;
  intro_monthly_usd: number;
  intro_months: number;
  intro_label: string | null;
};

export async function getPricing(): Promise<Pricing> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("plan_pricing")
      .select("plan, monthly_usd, annual_usd, intro_enabled, intro_monthly_usd, intro_months, intro_label");
    if (error || !data) return DEFAULTS;

    const pick = (id: PlanId): PlanPricing => {
      const row = (data as Row[]).find((r) => r.plan === id);
      if (!row) return DEFAULTS[id];
      return {
        monthly: row.monthly_usd,
        annual: row.annual_usd,
        introEnabled: row.intro_enabled,
        introMonthly: row.intro_monthly_usd,
        introMonths: row.intro_months,
        introLabel: row.intro_label,
      };
    };
    return { starter: pick("starter"), growth: pick("growth") };
  } catch {
    return DEFAULTS;
  }
}

/**
 * The standard (ongoing) amount to record/charge for a plan and cycle. Server
 * authority for billing. The introductory price is a first-period concession
 * applied at billing time; the ongoing price is what we record here.
 */
export function standardAmount(pricing: Pricing, plan: PlanId, cycle: BillingCycle): number {
  return cycle === "monthly" ? pricing[plan].monthly : pricing[plan].annual;
}
