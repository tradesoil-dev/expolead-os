import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type TrialStatus = {
  isExpired: boolean;
  isWarning: boolean;   // ≤ 7 days left
  daysLeft: number;
  plan: string;
  subscriptionStatus: string;
  /**
   * CSV export is a paid feature (Starter & Growth). Trial users cannot export
   * at any point — not during the 14 days and not after expiry. This closes the
   * "capture free → export on day 13 → re-register next show" loop.
   * Granting early_access unlocks it manually for pilots.
   */
  canExport: boolean;
};

export const TRIAL_FALLBACK: TrialStatus = {
  isExpired: false,
  isWarning: false,
  daysLeft: 14,
  plan: "trial",
  subscriptionStatus: "trialing",
  canExport: false,
};

type TrialProfileRow = {
  plan: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  early_access: boolean | null;
} | null;

/**
 * Pure computation of trial status from a profile row. Lets a caller that has
 * already fetched the profile (the app layout) avoid a second getUser and a
 * second profile query just to learn the trial state.
 */
export function computeTrialStatus(data: TrialProfileRow): TrialStatus {
  if (!data) return TRIAL_FALLBACK;

  if (data.subscription_status === "active") {
    return { isExpired: false, isWarning: false, daysLeft: 999, plan: data.plan ?? "trial", subscriptionStatus: "active", canExport: true };
  }
  if (data.early_access) {
    return { isExpired: false, isWarning: false, daysLeft: 999, plan: data.plan ?? "trial", subscriptionStatus: "early_access", canExport: true };
  }

  const now = new Date();
  const trialEnd = new Date(data.trial_ends_at ?? now);
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysLeft <= 0,
    isWarning: daysLeft > 0 && daysLeft <= 7,
    daysLeft: Math.max(0, daysLeft),
    plan: data.plan ?? "trial",
    subscriptionStatus: data.subscription_status ?? "trialing",
    canExport: false,
  };
}

export async function getTrialStatus(): Promise<TrialStatus> {
  const fallback: TrialStatus = {
    isExpired: false,
    isWarning: false,
    daysLeft: 14,
    plan: "trial",
    subscriptionStatus: "trialing",
    canExport: false,
  };

  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fallback;

  const { data } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at, subscription_status, early_access")
    .eq("id", user.id)
    .single();

  if (!data) return fallback;

  // Active paid plan — never locked
  if (data.subscription_status === "active") {
    return { isExpired: false, isWarning: false, daysLeft: 999, plan: data.plan, subscriptionStatus: "active", canExport: true };
  }

  // Early access granted — bypass trial lock entirely
  if (data.early_access) {
    return { isExpired: false, isWarning: false, daysLeft: 999, plan: data.plan, subscriptionStatus: "early_access", canExport: true };
  }

  const now = new Date();
  const trialEnd = new Date(data.trial_ends_at);
  const msLeft = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysLeft <= 0,
    isWarning: daysLeft > 0 && daysLeft <= 7,
    daysLeft: Math.max(0, daysLeft),
    plan: data.plan,
    subscriptionStatus: data.subscription_status,
    canExport: false,
  };
}
