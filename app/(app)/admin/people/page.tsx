import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import AdminPeople from "@/components/AdminPeople";

export const metadata = { title: "People | Admin" };

export default async function AdminPeoplePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const { data } = await supabase.rpc("admin_list_signups");
  // Pilot details (invite date, access window, campaign) so Plan shows what the
  // account really has, not just its original trial dates. Best effort.
  const pilotById = new Map<string, { pilot_invited_at: string | null; early_access_until: string | null; pilot_campaign: string | null }>();
  try {
    const { data: pilots } = await supabase.rpc("admin_list_pilots");
    for (const p of (pilots ?? []) as any[]) {
      pilotById.set(p.id, { pilot_invited_at: p.pilot_invited_at ?? null, early_access_until: p.early_access_until ?? null, pilot_campaign: p.pilot_campaign ?? null });
    }
  } catch {
    /* no pilot details */
  }
  const people = ((data ?? []) as any[]).map((p) => ({ ...p, ...(pilotById.get(p.id) ?? {}) }));

  return (
    <>
      <PageHeader title="People" subtitle="Everyone who has signed up, your traction at a glance" />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <AdminPeople people={people} />
      </main>
    </>
  );
}
