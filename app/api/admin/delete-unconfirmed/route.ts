import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only one-click cleanup of unconfirmed signups (bots / abandoned).
 * The real safety lives in the DB function admin_delete_unconfirmed():
 * it is is_admin()-gated and only removes never-confirmed accounts older
 * than 24 hours. This route just gates the button and reports the count.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Not permitted" }, { status: 403 });
  }

  const { data, error } = await supabase.rpc("admin_delete_unconfirmed");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: data ?? 0 }, { status: 200 });
}
