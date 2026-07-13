import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AccountMenu from "@/components/AccountMenu";
import TrialBanner from "@/components/TrialBanner";
import HelpMenu from "@/components/HelpMenu";
import NotificationsMenu from "@/components/NotificationsMenu";
import GlobalSearch from "@/components/GlobalSearch";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getTrialStatus } from "@/lib/trial";
import { sendWelcomeEmail } from "@/lib/welcome-email";

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

    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("signup_country, welcome_sent, full_name")
        .eq("id", user.id)
        .single();

      // Stamp the user's country from Vercel's geo header on first visit.
      if (prof && !prof.signup_country) {
        const country = (await headers()).get("x-vercel-ip-country");
        if (country) {
          await supabase.from("profiles").update({ signup_country: country }).eq("id", user.id);
        }
      }

      // Send the welcome email exactly once — after email is confirmed and the
      // user first lands in the app (not at signup).
      if (prof && !prof.welcome_sent && user.email_confirmed_at && user.email) {
        await supabase.from("profiles").update({ welcome_sent: true }).eq("id", user.id);
        try {
          await sendWelcomeEmail(user.email, (prof.full_name ?? "").split(" ")[0] || "there");
        } catch {
          // non-fatal — never block the app render on email delivery
        }
      }
    }
  }

  const trial = await getTrialStatus();

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav email={email} />
        <div className="hidden md:flex items-center gap-3 px-6 h-14 border-b border-ink-100 bg-white shrink-0">
          <div className="w-full max-w-md">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <HelpMenu />
            <NotificationsMenu daysLeft={trial.daysLeft} isExpired={trial.isExpired} />
            <div className="ml-2">
              <AccountMenu email={email} />
            </div>
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
