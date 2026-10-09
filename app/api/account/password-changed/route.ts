import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendPasswordChangedEmail } from "@/lib/password-changed-email";

export const runtime = "nodejs";

// Called by the app's password-change flows AFTER the password was successfully
// changed (reset/login page and the in-app change-password form). Records the
// event in the DB and emails the account owner. Everything is best-effort:
// a failure here never affects the password change itself, which already
// happened client-side.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false }, { status: 401 });

  let source = "your account";
  try {
    const body = await req.json();
    if (typeof body?.source === "string" && body.source.trim()) source = body.source.trim().slice(0, 80);
  } catch {
    // no body is fine
  }

  // Record in the DB (service role; best-effort).
  try {
    const admin = createServiceClient();
    await admin.from("security_events").insert({ user_id: user.id, type: "password_changed", detail: source });
  } catch {
    // audit table missing / transient — do not fail the notification
  }

  // Notify the owner (best-effort).
  let emailSent = true;
  try {
    const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const first = (prof?.full_name ?? "").trim().split(" ")[0] || "there";
    await sendPasswordChangedEmail(user.email, first, source);
  } catch {
    emailSent = false;
  }

  return NextResponse.json({ ok: true, emailSent });
}
