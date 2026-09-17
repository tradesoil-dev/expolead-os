import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPricing } from "@/lib/pricing";
import PageHeader from "@/components/PageHeader";
import AdminPricing from "@/components/AdminPricing";

export const metadata = { title: "Pricing — Admin" };

export default async function AdminPricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const pricing = await getPricing();

  return (
    <>
      <PageHeader
        title="Pricing"
        subtitle="Set base prices and the introductory offer, live across the site"
      />
      <main className="flex-1 p-6 md:p-8">
        <AdminPricing pricing={pricing} />
      </main>
    </>
  );
}
