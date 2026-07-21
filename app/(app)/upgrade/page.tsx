import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus } from "@/lib/trial";
import UpgradeFlow from "@/components/UpgradeFlow";

export const metadata = { title: "Upgrade — ExpoLead OS" };

// Trial caps, mirrored from migration 0022 so the page can show usage
// against them. Keep in step if the caps ever change.
const LIMITS = { exhibitions: 1, connections: 25, opportunities: 25 };

export default async function UpgradePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trial = await getTrialStatus();

  // Already paying or on early access: nothing to sell them.
  if (trial.subscriptionStatus === "active" || trial.subscriptionStatus === "early_access") {
    return (
      <main className="flex-1 p-6 md:p-8">
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <p className="text-lg font-bold text-emerald-900">Your account is already unlocked</p>
          <p className="mt-2 text-sm text-emerald-800">
            You have full access with no trial limits. Nothing to do here.
          </p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const [{ count: connections }, { count: opportunities }, { count: exhibitions }] = await Promise.all([
    supabase.from("suppliers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("exhibitions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="mx-auto max-w-lg">
        <Link href="/dashboard" className="text-sm text-emerald-700 hover:underline">
          &larr; Back to dashboard
        </Link>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-ink-900">Upgrade your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Unlimited shows, unlimited connections, and CSV export.
        </p>

        <div className="mt-6">
          <UpgradeFlow
            daysLeft={trial.daysLeft}
            isExpired={trial.isExpired}
            usage={{
              connections: connections ?? 0,
              opportunities: opportunities ?? 0,
              exhibitions: exhibitions ?? 0,
            }}
            limits={LIMITS}
          />
        </div>
      </div>
    </main>
  );
}
