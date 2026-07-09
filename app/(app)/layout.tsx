import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AccountMenu from "@/components/AccountMenu";
import TrialBanner from "@/components/TrialBanner";
import HelpMenu from "@/components/HelpMenu";
import NotificationsMenu from "@/components/NotificationsMenu";
import GlobalSearch from "@/components/GlobalSearch";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getTrialStatus } from "@/lib/trial";

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

  const trial = await getTrialStatus();

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav email={email} />
        <div className="hidden md:flex items-center gap-3 px-6 h-14 border-b border-ink-100 bg-white shrink-0">
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>
          <HelpMenu />
          <NotificationsMenu daysLeft={trial.daysLeft} isExpired={trial.isExpired} />
          <div className="ml-2">
            <AccountMenu email={email} />
          </div>
        </div>
        <TrialBanner
          isExpired={trial.isExpired}
          isWarning={trial.isWarning}
          daysLeft={trial.daysLeft}
        />
        {children}
      </div>
    </div>
  );
}
