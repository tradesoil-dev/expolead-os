import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import PageHeader from "@/components/PageHeader";
import FeedbackDashboard, { type CheckinRow } from "@/components/FeedbackDashboard";

export const metadata = { title: "Admin Feedback" };

// Admin > Feedback: every check-in survey sent, who answered, and what
// exhibitors tell us across campaigns. The table is server-only, so it is
// read with the service role after the is_admin check below.
export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  let rows: CheckinRow[] = [];
  let notReady = false;
  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from("feedback_checkins")
      .select("id, user_id, exhibition_name, campaign, survey_version, sent_at, answered_at, answers, wants_call")
      .order("sent_at", { ascending: false })
      .limit(1000);
    if (error) {
      notReady = true;
    } else {
      const ids = Array.from(new Set((data ?? []).map((r) => r.user_id)));
      const { data: profs } = ids.length
        ? await admin.from("profiles").select("id, full_name, company_name").in("id", ids)
        : { data: [] as { id: string; full_name: string | null; company_name: string | null }[] };
      const emails = new Map<string, string>();
      await Promise.all(
        ids.map(async (id) => {
          try {
            const { data: u } = await admin.auth.admin.getUserById(id);
            if (u?.user?.email) emails.set(id, u.user.email);
          } catch {
            /* show without email */
          }
        }),
      );
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      rows = (data ?? []).map((r) => ({
        ...r,
        email: emails.get(r.user_id) ?? "",
        full_name: byId.get(r.user_id)?.full_name ?? null,
        company_name: byId.get(r.user_id)?.company_name ?? null,
      })) as CheckinRow[];
    }
  } catch {
    notReady = true;
  }

  return (
    <>
      <PageHeader title="Feedback" subtitle="Check-in surveys you have sent, who answered, and what exhibitors tell us" />
      <main className="flex-1 p-6 md:p-8">
        {notReady ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Feedback is not set up yet. Run migration 0054 in the Supabase SQL editor, then reload this page.
          </div>
        ) : (
          <FeedbackDashboard rows={rows} />
        )}
      </main>
    </>
  );
}
