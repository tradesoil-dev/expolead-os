import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import InviteCustomer from "@/components/InviteCustomer";

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

  return (
    <>
      <PageHeader
        title="Pilot invite"
        subtitle="Give a customer full access by email, case by case"
      />
      <main className="flex-1 space-y-4 p-6 md:p-8">
        <InviteCustomer />
        <p className="max-w-2xl text-xs leading-relaxed text-ink-400">
          Creates the account, emails a secure set-your-own-password link, and grants full access
          until the date you choose (with ELOS if you enable it). When the date passes the account
          locks automatically. Use it for pilots and one-off access grants. Your subscriber list and
          traction stay on the People page.
        </p>
      </main>
    </>
  );
}
