/**
 * Turns database-level refusals into something a user can act on.
 *
 * When a trial account hits its limit (1 exhibition, 25 connections, 25
 * opportunities) or passes day 14, the INSERT is blocked by row-level security
 * and Postgres returns "new row violates row-level security policy for table
 * ...". That is accurate but meaningless to an exhibitor, so it gets swapped
 * for the reason it actually happened.
 */

type Kind = "exhibition" | "connection" | "opportunity";

const LIMITS: Record<Kind, string> = {
  exhibition: "1 exhibition",
  connection: "25 connections",
  opportunity: "25 opportunities",
};

function isTrialBlock(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return e.code === "42501" || /row-level security/i.test(e.message ?? "");
}

export function saveErrorMessage(err: unknown, kind: Kind, fallback: string): string {
  if (isTrialBlock(err)) {
    return `Your free trial covers ${LIMITS[kind]} and 14 days of access. You have reached that limit, so this could not be saved. Everything you have already captured stays available. Upgrade to Starter or Growth to keep adding.`;
  }
  return err instanceof Error ? err.message : fallback;
}

/**
 * Turns Supabase's password-strength refusals into plain guidance. With leaked
 * password protection (HaveIBeenPwned) and strength rules enabled in the
 * Supabase dashboard, sign-up and password reset can now be rejected with
 * messages like "Password is known to be easy to guess" or "Password should
 * contain...". Returns a friendly line for those, or null so the caller can
 * fall back to its own handling (e.g. the length message, which is already
 * clear on its own).
 */
export function friendlyPasswordError(err: unknown): string | null {
  const raw = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  if (!raw) return null;
  if (/pwned|leaked|known to be|data breach|easy to guess|compromis|weak.?password|too weak/.test(raw)) {
    return "That password has turned up in a known data breach or is too easy to guess. Please choose a stronger one.";
  }
  if (/should contain|at least one character of each|character types|requires/.test(raw)) {
    return "Please make your password stronger by mixing in letters, numbers and a symbol.";
  }
  return null;
}
