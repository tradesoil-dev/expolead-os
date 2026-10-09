import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// Admin-only: revoke a pilot's access. Clears the pilot flags so the account
// locks and drops off the Invited pilots list. The account and its data remain
// (use the People page to delete an account entirely). Never touches an admin.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  let userId = "";
  try {
    const body = await req.json();
    userId = typeof body?.user_id === "string" ? body.user_id : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!userId) return NextResponse.json({ error: "Missing user." }, { status: 400 });

  const admin = createServiceClient();

  // Safeguard: never revoke/alter an admin from here.
  const { data: target } = await admin.from("profiles").select("is_admin").eq("id", userId).single();
  if (target?.is_admin) {
    return NextResponse.json({ error: "Cannot change an admin account from here." }, { status: 400 });
  }

  const { error } = await admin
    .from("profiles")
    .update({ early_access_until: null, elos_enabled: false, pilot_invited_at: null })
    .eq("id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
