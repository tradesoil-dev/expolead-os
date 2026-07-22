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
  let headerProfile = {
    full_name: null as string | null,
    company_name: null as string | null,
    avatar_url: null as string | null,
    avatar_position_y: null as number | null,
    is_admin: false,
  };

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;

    if (user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("signup_country, welcome_sent, full_name, company_name, avatar_url, avatar_position_y, is_admin")
        .eq("id", user.id)
        .single();

      if (prof) {
        headerProfile = {
          full_name: prof.full_name ?? null,
          company_name: prof.company_name ?? null,
          avatar_url: prof.avatar_url ?? null,
          avatar_position_y: prof.avatar_position_y ?? null,
          is_admin: !!prof.is_admin,
        };
      }

      // Stamp the user's country from Vercel's geo header on first visit.
      if (prof && !prof.signup_country) {
        const country = (await headers()).get("x-vercel-ip-country");
        if (country) {
          await supabase.from("profiles").update({ signup_country: country }).eq("id", user.id);
        }
      }

      // Send the welcome email exactly once — after email is confirmed and the
      // user first lands in the app (not at signup). The update is atomic
      // (only flips false -> true) so concurrent page loads can't double-send:
      // only the request that actually claimed the flag sends the email.
      if (prof && !prof.welcome_sent && user.email_confirmed_at && user.email) {
        const { data: claimed } = await supabase
          .from("profiles")
          .update({ welcome_sent: true })
          .eq("id", user.id)
          .eq("welcome_sent", false)
          .select("id");
        if (claimed && claimed.length > 0) {
          try {
            await sendWelcomeEmail(user.email, (prof.full_name ?? "").split(" ")[0] || "there");
          } catch {
            // non-fatal — never block the app render on email delivery
          }
        }
      }
    }
  }

  const trial = await getTrialStatus();

  return (
    <div className="flex min-h-screen">
      <Sidebar email={email} />
      <div className="flex-1 min-w-0 flex flex-col">
        <MobileNav email={email} profile={headerProfile} />
        <div className="hidden md:flex items-center gap-3 px-6 h-14 border-b border-ink-100 bg-white shrink-0 sticky top-0 z-40">
          <div className="w-full max-w-md">
            <GlobalSearch />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <HelpMenu />
            <NotificationsMenu daysLeft={trial.daysLeft} isExpired={trial.isExpired} />
            <div className="ml-2">
              <AccountMenu email={email} profile={headerProfile} />
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
