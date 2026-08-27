import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeTrialStatus } from "@/lib/trial";

type ExportAccessOk = {
  ok: true;
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

type ExportAccessError = {
  ok: false;
  response: NextResponse;
};

/**
 * Shared server-side export gate used by BOTH export routes (Connections and
 * Opportunities) so they apply exactly the same entitlement rule. It:
 *
 * - verifies the Supabase session on the server (401 if missing)
 * - re-checks eligibility on every request via computeTrialStatus, the same
 *   pure rule the pages use (403 if the plan does not allow export)
 *
 * Nothing is trusted from the browser: plan, subscription status, user id and
 * eligibility are all derived from the session and the database. Error bodies
 * are intentionally generic and never expose profile / subscription / DB detail.
 *
 * Returns the authenticated Supabase client and user id on success so the caller
 * can run its export query under the same RLS-scoped session.
 */
export async function requireExportAccess(): Promise<ExportAccessOk | ExportAccessError> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at, subscription_status, early_access")
    .eq("id", user.id)
    .single();

  const trial = computeTrialStatus(profile ?? null);

  if (!trial.canExport) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "CSV export is available on the Starter and Growth plans." },
        { status: 403 },
      ),
    };
  }

  return { ok: true, supabase, userId: user.id };
}
