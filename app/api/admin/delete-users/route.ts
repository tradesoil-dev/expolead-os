import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-only per-row / bulk delete of specific accounts from the People page.
 * Real safety lives in admin_delete_users(): is_admin()-gated, and it refuses
 * to delete the caller or any other admin. This route just gates the call and
 * validates the payload.
 */
export async function POST(req: Request) {
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

  let ids: unknown;
  try {
    ({ ids } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((x) => typeof x === "string")) {
    return NextResponse.json({ error: "No accounts selected" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("admin_delete_users", { p_ids: ids });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: data ?? 0 }, { status: 200 });
}
