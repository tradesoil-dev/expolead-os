import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Handles the redirect from Supabase email links (confirm signup, magic link,
// password reset). Exchanges the one-time code for a real session, then sends
// the user into the app — which triggers the post-confirmation welcome email.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Email is now confirmed. Don't auto-login — sign out and send the user
      // to the sign-in page to log in themselves.
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?confirmed=1`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
