import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// Permanent per-account trial caps on the paid AI features. Backed by the
// Postgres RPCs in migration 0045. Unlike the hourly rate limit (lib/rate-limit),
// these never reset: they are the "taste, then upgrade" gate for trial accounts.
//
// The limits themselves live in the database (trial_ai_limit), so the server
// only ever names the feature, never the number the client could tamper with.
export type TrialFeature = "recording" | "card_scan";

export type TrialQuota = {
  unlimited: boolean;      // paid / early_access / admin -> never blocked
  used: number;
  limit: number;
  remaining: number | null; // null when unlimited
};

function parse(data: unknown): TrialQuota | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  return {
    unlimited: d.unlimited === true,
    used: typeof d.used === "number" ? d.used : 0,
    limit: typeof d.limit === "number" ? d.limit : 0,
    remaining: typeof d.remaining === "number" ? d.remaining : null,
  };
}

/**
 * Read the current trial quota for a feature without consuming it. Used to gate
 * a request before the paid API call, and to show the "X of N left" nudge.
 *
 * Returns null if the limiter is unavailable (migration 0045 not applied yet, or
 * a transient error). Callers treat null as "allow" (fail open) so the feature
 * keeps working before the migration is run; the hourly rate limit and the
 * Anthropic spend cap remain the cost backstops.
 */
export async function peekTrialQuota(
  supabase: ServerClient,
  feature: TrialFeature,
): Promise<TrialQuota | null> {
  try {
    const { data, error } = await supabase.rpc("peek_trial_quota", { p_feature: feature });
    if (error) return null;
    return parse(data);
  } catch {
    return null;
  }
}

/**
 * Record one successful use of a feature. Call this AFTER the paid API call
 * succeeds, so failed or unreadable attempts do not burn a trial credit. No-op
 * for unlimited accounts. Returns the updated quota (or null if unavailable).
 */
export async function bumpTrialQuota(
  supabase: ServerClient,
  feature: TrialFeature,
): Promise<TrialQuota | null> {
  try {
    const { data, error } = await supabase.rpc("bump_trial_quota", { p_feature: feature });
    if (error) return null;
    return parse(data);
  } catch {
    return null;
  }
}

/** True when a trial account has run out of a feature's allowance. */
export function isTrialExhausted(q: TrialQuota | null): boolean {
  return !!q && !q.unlimited && (q.remaining ?? 0) <= 0;
}
