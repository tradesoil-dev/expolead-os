/**
 * Single source of truth for what a paid plan costs. Used by the upgrade
 * flow so the price is never taken from the browser.
 *
 * Annual is exactly 12x monthly. It is a billing convenience for
 * procurement, NOT a discount, and no "save two months" claim may be made.
 */
export const PLAN_PRICES = {
  starter: { monthly: 29, annual: 348 },
  growth: { monthly: 99, annual: 1188 },
} as const;

export type PlanId = keyof typeof PLAN_PRICES;
export type BillingCycle = "monthly" | "annual";

export const PLAN_LABELS: Record<PlanId, { name: string; tagline: string }> = {
  starter: { name: "Starter", tagline: "Everything one person needs" },
  growth: { name: "Growth", tagline: "For teams working shows together" },
};

/**
 * Bank details shown on the upgrade page. PLACEHOLDERS — replace with the
 * real account before telling anyone to transfer money.
 */
export const BANK_DETAILS = [
  { label: "Account name", value: "ExpoLead OS" },
  { label: "Bank", value: "[ BANK NAME ]" },
  { label: "Account number", value: "[ ACCOUNT NUMBER ]" },
  { label: "Branch", value: "[ BRANCH ]" },
  { label: "SWIFT code", value: "[ SWIFT ]" },
];
