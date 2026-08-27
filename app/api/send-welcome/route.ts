import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export async function POST(req: NextRequest) {
  // Fail CLOSED: without a configured server secret, refuse rather than accept
  // anything. The secret is only ever accepted via this request header, never a
  // URL or a NEXT_PUBLIC variable.
  const expected = process.env.INTERNAL_API_SECRET;
  if (!expected) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const secret = req.headers.get("x-internal-secret");
  if (secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, name } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const firstName = name?.split(" ")[0] || "there";
  const { error } = await sendWelcomeEmail(email, firstName);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
