import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import SurveyFlow from "@/components/SurveyFlow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your post-show check | ExpoLead OS",
  robots: { index: false, follow: false },
};

// Pilot check-in survey reached from the check-in email. No sign-in: the token
// in the URL is matched by its SHA-256 hash. Opening the page changes nothing
// (so email link scanners cannot answer it); only a real submit does.
export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let state: "invalid" | "answered" | "open" = "invalid";
  let firstName = "";
  let preparedFor = "";
  let exhibition = "";
  let campaign = "";

  if (token && /^[A-Za-z0-9_-]{20,100}$/.test(token)) {
    try {
      const admin = createServiceClient();
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const { data: row } = await admin
        .from("feedback_checkins")
        .select("user_id, exhibition_name, campaign, answered_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      if (row) {
        exhibition = row.exhibition_name;
        campaign = row.campaign;
        state = row.answered_at ? "answered" : "open";
        const { data: prof } = await admin.from("profiles").select("full_name, company_name").eq("id", row.user_id).maybeSingle();
        const full = (prof?.full_name ?? "").trim();
        firstName = full.split(" ")[0] ?? "";
        preparedFor = [full, (prof?.company_name ?? "").trim()].filter(Boolean).join(", ");
      }
    } catch {
      state = "invalid";
    }
  }

  if (state === "open") {
    return (
      <SurveyFlow
        mode="pilot"
        exhibition={exhibition}
        campaignLabel={campaign || exhibition}
        token={token}
        firstName={firstName}
        preparedFor={preparedFor}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl text-lg font-bold tracking-wide text-slate-900">
          EXPOLEAD <span className="text-emerald-600">OS</span>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h1 className="text-xl font-bold text-slate-900">
            {state === "answered" ? "Thank you, we already have your answers" : "This link is not valid"}
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-slate-600">
            {state === "answered"
              ? "Your feedback has been received. If you would like to add anything, just reply to our email."
              : "The survey link may be incomplete. Please open it again from the email, or reply to us at hello@expoleados.com."}
          </p>
          <a
            href="/login"
            className="mt-6 inline-flex min-h-10 items-center rounded-lg border border-emerald-600 px-5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Open ExpoLead OS
          </a>
        </div>
      </div>
    </main>
  );
}
