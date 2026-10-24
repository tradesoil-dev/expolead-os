import type { SupabaseClient } from "@supabase/supabase-js";

// Daily safety cap for survey report emails. Every ExpoLead email (sign-up,
// password reset, invites, check-ins, reports) shares one Resend account whose
// free plan stops sending after 100 emails a day. Report emails stop at 50 a
// day so the rest stays free for sign-in and invite emails. People still see
// their full report on screen; only the email copy is skipped.
//
// Counts surveys completed today (UTC), public and pilot, each of which sends
// at most one report email. The just-saved answer is included in the count.
export const REPORT_EMAILS_PER_DAY = 50;

export async function reportEmailAllowed(admin: SupabaseClient): Promise<boolean> {
  try {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const since = start.toISOString();
    const [pub, pil] = await Promise.all([
      admin.from("survey_responses").select("id", { count: "exact", head: true }).gte("created_at", since),
      admin.from("feedback_checkins").select("id", { count: "exact", head: true }).gte("answered_at", since),
    ]);
    return (pub.count ?? 0) + (pil.count ?? 0) <= REPORT_EMAILS_PER_DAY;
  } catch {
    // If the count fails, skip the email rather than risk the shared quota.
    return false;
  }
}
