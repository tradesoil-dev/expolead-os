import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getExhibitionLibrary } from "@/lib/data";
import AdminLibraryManager from "@/components/AdminLibraryManager";

export const metadata = { title: "Exhibition Library — Admin" };

export default async function AdminLibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  const shows = await getExhibitionLibrary();

  return (
    <main className="flex-1 p-6 md:p-8">
      <AdminLibraryManager shows={shows} />
    </main>
  );
}
