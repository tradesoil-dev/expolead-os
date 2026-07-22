import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import AdminSubscriptions, { type UpgradeRow } from "@/components/AdminSubscriptions";

export const metadata = { title: "Subscriptions — Admin" };

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const { data } = await supabase.rpc("admin_list_upgrade_requests");

  return (
    <>
      <PageHeader
        title="Subscriptions"
        subtitle="Who wants to pay, who has paid, and what is still owed"
      />
      <main className="flex-1 p-6 md:p-8">
        <AdminSubscriptions rows={(data ?? []) as UpgradeRow[]} />
      </main>
    </>
  );
}
