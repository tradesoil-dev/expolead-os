import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTrialStatus } from "@/lib/trial";
import { PLAN_LABELS, type PlanId } from "@/lib/plans";

export const metadata = { title: "Billing — ExpoLead OS" };

function money(n: number) {
  return `USD ${Number(n).toFixed(2)}`;
}
function date(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function addCycle(iso: string, cycle: string) {
  const d = new Date(iso);
  if (cycle === "annual") d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
}

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trial = await getTrialStatus();

  // Most recent confirmed payment, if any. RLS lets a user read their own.
  const { data: paid } = await supabase
    .from("upgrade_requests")
    .select("plan, billing_cycle, amount_usd, confirmed_at, reference")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("confirmed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPaid = trial.subscriptionStatus === "active" || trial.subscriptionStatus === "early_access";

  return (
    <main className="flex-1 p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-black tracking-tight text-ink-900">Billing</h1>
        <p className="mt-1 text-sm text-ink-500">Your plan, payments and what is due next.</p>

        {/* ---- Paid, with a confirmed payment on record ---- */}
        {isPaid && paid ? (
          <>
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Current plan</p>
                  <p className="mt-1 text-2xl font-black text-ink-900">
                    {PLAN_LABELS[paid.plan as PlanId]?.name ?? paid.plan}
                  </p>
                  <p className="text-sm text-emerald-800 capitalize">Billed {paid.billing_cycle}</p>
                </div>
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">Active</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-6">
              <dl className="divide-y divide-ink-100 text-sm">
                <Row label="Amount">{money(paid.amount_usd)} per {paid.billing_cycle === "annual" ? "year" : "month"}</Row>
                <Row label="Started">{date(paid.confirmed_at)}</Row>
                <Row label="Paid until">{date(addCycle(paid.confirmed_at, paid.billing_cycle).toISOString())}</Row>
                <Row label="Next payment due">
                  {date(addCycle(paid.confirmed_at, paid.billing_cycle).toISOString())}
                  <span className="ml-2 text-xs text-ink-400">to keep your plan active</span>
                </Row>
                <Row label="Payment method">Bank transfer</Row>
                <Row label="Last reference">{paid.reference}</Row>
              </dl>
              <p className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-xs leading-relaxed text-ink-500">
                We will email you before your renewal is due with the amount and bank details. Card
                payment is coming soon, and your plan continues in the meantime.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/upgrade" className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Change plan
              </Link>
              <a href="mailto:hello.expolead@tradesoil.com?subject=Billing%20question" className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                Email us about billing
              </a>
            </div>
          </>
        ) : isPaid && !paid ? (
          /* ---- Access granted without a payment on record (pilot / comp) ---- */
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Current plan</p>
            <p className="mt-1 text-2xl font-black text-ink-900">Full access</p>
            <p className="mt-2 text-sm text-emerald-800">
              Your account has full access with no trial limits. There is nothing to pay right now.
              If you expected to see a paid plan here, reply to any of our emails and we will sort it.
            </p>
          </div>
        ) : (
          /* ---- Trial ---- */
          <>
            <div className="mt-6 rounded-2xl border border-ink-200 bg-white p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">Current plan</p>
              <p className="mt-1 text-2xl font-black text-ink-900">Free trial</p>
              <p className="mt-2 text-sm text-ink-600">
                {trial.isExpired
                  ? "Your trial has ended. You can still view and edit everything you captured. Upgrade to add new records and unlock CSV export."
                  : `${trial.daysLeft} ${trial.daysLeft === 1 ? "day" : "days"} left. You have full access to capture one show. Upgrade any time for unlimited exhibitions, connections and export.`}
              </p>
            </div>
            <Link href="/upgrade" className="mt-4 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              View plans and upgrade
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{children}</dd>
    </div>
  );
}
