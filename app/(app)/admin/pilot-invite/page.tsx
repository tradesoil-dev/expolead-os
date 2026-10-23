import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import PageHeader from "@/components/PageHeader";
import InviteCustomer from "@/components/InviteCustomer";
import PilotInvitesList, { type PilotRow, type LatestCheckin } from "@/components/PilotInvitesList";

export const metadata = { title: "Pilot invite — Admin" };

export default async function AdminPilotInvitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  let pilots: PilotRow[] = [];
  try {
    const { data } = await supabase.rpc("admin_list_pilots");
    pilots = (data ?? []) as PilotRow[];
  } catch {
    // Migration not applied yet, or transient error: show an empty list.
  }

  // Latest check-in per pilot, for the "Check-in sent / Answered" note on each
  // row. Server-only table, read with the service role after the admin check.
  // Best-effort: before migration 0054 the rows simply show no note.
  const checkins: Record<string, LatestCheckin> = {};
  if (pilots.length) {
    try {
      const { data } = await createServiceClient()
        .from("feedback_checkins")
        .select("user_id, campaign, sent_at, answered_at")
        .in("user_id", pilots.map((p) => p.id))
        .order("sent_at", { ascending: false });
      for (const c of data ?? []) {
        if (!checkins[c.user_id]) checkins[c.user_id] = { campaign: c.campaign, sent_at: c.sent_at, answered_at: c.answered_at };
      }
    } catch {
      /* no notes */
    }
  }

  return (
    <>
      <PageHeader
        title="Pilot invite"
        subtitle="Give a customer full access by email, case by case"
      />
      <main className="flex-1 space-y-5 p-6 md:p-8">
        <InviteCustomer />
        <p className="max-w-2xl text-xs leading-relaxed text-ink-400">
          Creates the account, emails a secure set-your-own-password link, and grants full access
          until the date you choose (with ELOS if you enable it). When the date passes the account
          locks automatically. Use it for pilots and one-off access grants. Your subscriber list and
          traction stay on the People page.
        </p>
        <PilotInvitesList rows={pilots} checkins={checkins} />
      </main>
    </>
  );
}
