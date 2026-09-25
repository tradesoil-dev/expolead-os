import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { peekAiRemaining } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Read-only: how many ELOS questions the signed-in user has left in the current
// hourly window. Drives the "N of 30 left this hour" counter in the chat drawer.
// Never consumes a slot. Admin-only while ELOS is in build (same gate as the
// chat and summarise routes).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: prof } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!prof?.is_admin) return NextResponse.json({ error: "Not available yet." }, { status: 403 });

  const hourly = await peekAiRemaining(supabase, "assistant");
  return NextResponse.json({ hourly });
}
