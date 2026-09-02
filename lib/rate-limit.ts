import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

// Per-user caps on the cost-bearing AI endpoints. Tune here. Each is a fixed
// window: `limit` requests per `windowSeconds` per signed-in user.
export const AI_LIMITS = {
  transcribe: { limit: 60, windowSeconds: 3600 },
  summarize: { limit: 60, windowSeconds: 3600 },
  scan_card: { limit: 60, windowSeconds: 3600 },
} as const;

export type RateBucket = keyof typeof AI_LIMITS;

/**
 * Durable per-user rate limit via the Postgres check_rate_limit() RPC
 * (migration 0042). Returns true when the request is allowed.
 *
 * Fails OPEN: if the limiter is unavailable (the migration is not applied yet,
 * or a transient DB error), the request is allowed rather than broken. The
 * Anthropic monthly spend cap remains the hard backstop on cost.
 */
export async function allowAiRequest(supabase: ServerClient, bucket: RateBucket): Promise<boolean> {
  const cfg = AI_LIMITS[bucket];
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_bucket: bucket,
      p_limit: cfg.limit,
      p_window_seconds: cfg.windowSeconds,
    });
    if (error) return true; // fail open (limiter unavailable)
    if (data && typeof data === "object" && (data as { allowed?: boolean }).allowed === false) {
      return false;
    }
    return true;
  } catch {
    return true; // fail open
  }
}
