import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/service";
import CheckinSurvey from "@/components/CheckinSurvey";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your feedback | ExpoLead OS",
  robots: { index: false, follow: false },
};

// Public, sign-in free survey page reached from the check-in email. The token
// in the URL is matched by its SHA-256 hash. Opening the page changes nothing
// (so email link scanners cannot answer it); only a real Send click does.
export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let state: "invalid" | "answered" | "open" = "invalid";
  let firstName = "";
  let exhibition = "";

  if (token && /^[A-Za-z0-9_-]{20,100}$/.test(token)) {
    try {
      const admin = createServiceClient();
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const { data: row } = await admin
        .from("feedback_checkins")
        .select("user_id, exhibition_name, answered_at")
        .eq("token_hash", tokenHash)
        .maybeSingle();
      if (row) {
        exhibition = row.exhibition_name;
        state = row.answered_at ? "answered" : "open";
        const { data: prof } = await admin.from("profiles").select("full_name").eq("id", row.user_id).maybeSingle();
        firstName = (prof?.full_name ?? "").trim().split(" ")[0] ?? "";
      }
    } catch {
      state = "invalid";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl text-lg font-bold tracking-wide text-slate-900">
          EXPOLEAD <span className="text-emerald-600">OS</span>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-12 pt-6">
        {state === "open" ? (
          <CheckinSurvey token={token} firstName={firstName} exhibition={exhibition} />
        ) : (
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
              className="mt-6 inline-block rounded-xl border border-emerald-600 px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Open ExpoLead OS
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
