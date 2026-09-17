import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import AdminPaymentsTest from "@/components/AdminPaymentsTest";
import { isPaymentsConfigured } from "@/lib/payments/paymentslk";

export const metadata = { title: "Payments sandbox — Admin" };

export default async function AdminPaymentsPage() {
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
        title="Payments sandbox"
        subtitle="Test the payments.lk checkout end to end (sandbox only)"
      />
      <main className="flex-1 p-6 md:p-8">
        <AdminPaymentsTest configured={isPaymentsConfigured()} />
      </main>
    </>
  );
}
