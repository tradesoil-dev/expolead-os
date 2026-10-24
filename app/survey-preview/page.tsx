import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SurveyFlow from "@/components/SurveyFlow";
import { buildCheckinEmail } from "@/lib/checkin-email";
import { CAMPAIGNS } from "@/lib/survey-v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Survey preview | Admin", robots: { index: false, follow: false } };

// Admin-only preview of the post-show surveys and their emails, built from the
// real survey and email code so what you read is exactly what people get.
// Dummy answers are never saved and nothing is emailed.
export default async function SurveyPreviewPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) redirect("/dashboard");

  const { mode } = await searchParams;
  const sial = CAMPAIGNS["sial-paris-2026"];

  if (mode === "public") {
    return <SurveyFlow preview mode="public" exhibition={sial.exhibition} campaignLabel={sial.label} campaignSlug={sial.slug} source="preview" />;
  }
  if (mode === "pilot") {
    return <SurveyFlow preview mode="pilot" exhibition={sial.exhibition} campaignLabel={sial.label} firstName="Eric" preparedFor="Eric Khor, Grusonn" />;
  }
  if (mode === "checkin-email") {
    const email = buildCheckinEmail({
      firstName: "Eric",
      exhibition: sial.exhibition,
      surveyUrl: "https://expoleados.com/survey-preview?mode=pilot",
      appUrl: "https://expoleados.com/login",
      accessUntilLabel: "30 November",
      notUsedYet: true,
    });
    return (
      <Shell>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pilot check-in email</p>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          Sent from Admin, Pilot invite, Send check-in · From Gladwin &amp; Gayan at ExpoLead OS &lt;hello@expoleados.com&gt; · Subject: <strong>{email.subject}</strong>
        </p>
        <p className="mb-3 text-xs text-slate-400">Shown for a pilot who has not captured anything yet. In this preview the survey button opens the pilot survey preview.</p>
        <iframe title="Check-in email preview" srcDoc={email.html} className="h-[1500px] w-full rounded-2xl border border-slate-200 bg-white" />
      </Shell>
    );
  }

  const items = [
    { href: "/survey-preview?mode=public", title: "Public survey", text: "What LinkedIn and WhatsApp visitors see, then the report and the exact report email they receive." },
    { href: "/survey-preview?mode=pilot", title: "Pilot survey", text: "What a pilot sees from the check-in email (shown as Eric), then the report." },
    { href: "/survey-preview?mode=checkin-email", title: "Pilot check-in email", text: "The email a pilot receives when you press Send check-in." },
  ];
  return (
    <Shell>
      <h1 className="text-xl font-bold text-slate-900">Survey and email preview</h1>
      <p className="mt-1 text-sm text-slate-600">Fill in any dummy answers. Nothing is saved and no email is sent.</p>
      <div className="mt-5 space-y-3">
        {items.map((it) => (
          <Link key={it.href} href={it.href} className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-300">
            <p className="font-semibold text-slate-900">{it.title}</p>
            <p className="mt-0.5 text-sm text-slate-500">{it.text}</p>
          </Link>
        ))}
      </div>
      <Link href="/admin/feedback" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">Back to Feedback</Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">Admin preview. Nothing is saved or emailed.</div>
      <header className="border-b border-slate-200 bg-white px-4 py-3.5">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <span className="text-[17px] font-extrabold tracking-wide text-slate-900">EXPOLEAD <span className="text-emerald-600">OS</span></span>
          <Link href="/survey-preview" className="text-[13px] font-semibold text-emerald-700 hover:underline">All previews</Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 py-6">{children}</div>
    </main>
  );
}
