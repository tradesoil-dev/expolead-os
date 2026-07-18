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
