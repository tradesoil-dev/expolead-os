import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AccountMenu from "@/components/AccountMenu";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav email={email} />
        <div className="hidden md:flex items-center justify-end px-6 h-14 border-b border-ink-100 bg-white shrink-0">
          <AccountMenu email={email} />
        </div>
        {children}
      </div>
    </div>
  );
}
