import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import PageHeader from "@/components/PageHeader";
import FeedbackDashboard, { type FeedbackRow, type FeedbackTab } from "@/components/FeedbackDashboard";
import { CAMPAIGNS } from "@/lib/survey-v2";

export const metadata = { title: "Admin Feedback" };

// Admin > Feedback: pilot check-ins and public survey answers in one place.
// Both tables are server-only, so they are read with the service role after
// the is_admin check below. Each source fails safe on its own: if one table is
// missing (migration not run yet) the other still shows.
export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const rows: FeedbackRow[] = [];
  const missing: string[] = [];
  let admin: ReturnType<typeof createServiceClient> | null = null;
  try {
    admin = createServiceClient();
  } catch {
    missing.push("server key");
  }

  if (admin) {
    // Pilot check-ins.
    const { data: checks, error: cErr } = await admin
      .from("feedback_checkins")
      .select("id, user_id, exhibition_name, campaign, survey_version, sent_at, answered_at, answers, wants_call")
      .order("sent_at", { ascending: false })
      .limit(1000);
    if (cErr) missing.push("0054 (pilot check-ins)");
    else if (checks?.length) {
      const ids = Array.from(new Set(checks.map((r) => r.user_id)));
      const { data: profs } = await admin.from("profiles").select("id, full_name, company_name").in("id", ids);
      const emails = new Map<string, string>();
      await Promise.all(ids.map(async (id) => {
        try {
          const { data: u } = await admin!.auth.admin.getUserById(id);
          if (u?.user?.email) emails.set(id, u.user.email);
        } catch { /* show without email */ }
      }));
      const byId = new Map((profs ?? []).map((p) => [p.id, p]));
      for (const r of checks) {
        rows.push({
          id: r.id,
          kind: "pilot",
          name: byId.get(r.user_id)?.full_name ?? "",
          company: byId.get(r.user_id)?.company_name ?? "",
          email: emails.get(r.user_id) ?? "",
          campaign: r.campaign,
          source: "pilot",
          role: "exhibit",
          date: r.answered_at ?? r.sent_at,
          sentAt: r.sent_at,
          answeredAt: r.answered_at,
          version: r.survey_version,
          answers: r.answers,
          wantsCall: !!r.wants_call,
          wantsTry: false,
          whatsapp: "",
          linkedin: "",
          nextShow: typeof r.answers?.next_show === "string" ? r.answers.next_show : "",
          consent: false,
          wantsResults: false,
        });
      }
    }

    // Public survey answers.
    const { data: pubs, error: pErr } = await admin
      .from("survey_responses")
      .select("id, campaign, source, role_show, email, full_name, company_name, whatsapp, linkedin, next_show, wants_try, wants_results, consent_contact, survey_version, answers, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (pErr) missing.push("0055 (public survey)");
    else for (const r of pubs ?? []) {
      rows.push({
        id: r.id,
        kind: "public",
        name: r.full_name,
        company: r.company_name,
        email: r.email,
        campaign: CAMPAIGNS[r.campaign]?.label ?? r.campaign,
        source: r.source || "direct",
        role: r.role_show,
        date: r.created_at,
        sentAt: null,
        answeredAt: r.created_at,
        version: r.survey_version,
        answers: r.answers,
        wantsCall: false,
        wantsTry: !!r.wants_try,
        whatsapp: r.whatsapp ?? "",
        linkedin: r.linkedin ?? "",
        nextShow: r.next_show,
        consent: !!r.consent_contact,
        wantsResults: !!r.wants_results,
      });
    }
  }

  rows.sort((x, y) => (y.date ?? "").localeCompare(x.date ?? ""));

  return (
    <>
      <PageHeader title="Feedback" subtitle="Public survey links and answers, and pilot check-ins" />
      <main className="flex-1 space-y-4 p-6 md:p-8">
        {missing.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            Not set up yet: {missing.join(", ")}. Run the migration in the Supabase SQL editor, then reload this page.
          </div>
        )}
        <a href="/survey-preview" className="inline-flex min-h-9 items-center rounded-lg border border-emerald-200 bg-white px-3.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Preview surveys and emails</a>
        <FeedbackDashboard rows={rows} initialTab={(tab === "pilot" ? "pilot" : "public") as FeedbackTab} />
      </main>
    </>
  );
}
