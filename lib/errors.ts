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
