import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// For admin-only API routes: checks the signed-in user is an admin, then
// returns a service-role client for server-only tables. Every failure returns
// a ready response so the route can stop early.
export async function requireAdmin(): Promise<
  { ok: true; admin: ReturnType<typeof createServiceClient>; userId: string } | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Please sign in again." }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { ok: false, response: NextResponse.json({ error: "Not permitted." }, { status: 403 }) };
  try {
    return { ok: true, admin: createServiceClient(), userId: user.id };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Server key is not configured." }, { status: 500 }) };
  }
}
