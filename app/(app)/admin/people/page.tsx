import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import AdminPeople from "@/components/AdminPeople";

export const metadata = { title: "People — Admin" };

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
  const people = (data ?? []) as any[];

  return (
    <>
      <PageHeader title="People" subtitle="Everyone who has signed up — your traction at a glance" />
      <main className="flex-1 p-6 md:p-8">
        <AdminPeople people={people} />
      </main>
    </>
  );
}
