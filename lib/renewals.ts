import { createClient } from "@supabase/supabase-js";

// Core renewal-reminder logic, shared by the daily cron and the admin
// "Run renewal check now" button. Uses the service-role client because it
// reads every account and emails users other than the caller.
//
// Manual bank-transfer model: NO auto-lock. An overdue account is only flagged.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const NOTIFY_TO = "hello.expolead@tradesoil.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://expolead.tradesoil.com";

export type RenewalResult = { ok: boolean; pre: number; due: number; overdue: number; errors: number; checked: number; error?: string };

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "ExpoLead OS <hello.expolead@tradesoil.com>", to, subject, html, reply_to: replyTo }),
  });
  return res.ok;
}

function shell(inner: string) {
  return `<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
    <div style="background: #059669; padding: 22px 30px; border-radius: 12px 12px 0 0;"><h1 style="color:white;margin:0;font-size:19px;">ExpoLead OS</h1></div>
    <div style="padding: 28px 30px; background:#fff; border:1px solid #e2e8f0; border-top:none; border-radius:0 0 12px 12px;">${inner}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:22px 0;" />
    <p style="font-size:12px;color:#9ca3af;margin:0;">ExpoLead OS &middot; tradesoil.com</p></div></div>`;
}

function fmt(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function processRenewals(): Promise<RenewalResult> {
  const results: RenewalResult = { ok: true, pre: 0, due: 0, overdue: 0, errors: 0, checked: 0 };

  if (!RESEND_API_KEY || !SUPABASE_SERVICE_KEY) {
    return { ...results, ok: false, error: "Missing env vars" };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const now = new Date();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, plan, paid_until, renewal_reminder_stage")
    .not("paid_until", "is", null);

  if (!profiles || profiles.length === 0) return results;
  results.checked = profiles.length;

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  for (const u of authUsers?.users ?? []) if (u.email) emailMap[u.id] = u.email;

  const DAY = 24 * 60 * 60 * 1000;

  for (const p of profiles) {
    const email = emailMap[p.id];
    if (!email) continue;

    const due = new Date(p.paid_until as string);
    const daysToDue = Math.ceil((due.getTime() - now.getTime()) / DAY);
    const planName = (p.plan ?? "your").charAt(0).toUpperCase() + (p.plan ?? "your").slice(1);
    const stage = p.renewal_reminder_stage as string | null;

    let target: "pre" | "due" | "overdue" | null = null;
    if (daysToDue <= 0) target = daysToDue <= -3 ? "overdue" : "due";
    else if (daysToDue <= 7) target = "pre";

    if (!target || target === stage) continue;

    try {
      if (target === "pre") {
        await sendEmail(email, `Your ${planName} plan renews on ${fmt(due)}`,
          shell(`<p style="font-size:16px;margin-top:0;">Hi ${p.full_name || "there"},</p>
            <p style="font-size:15px;color:#374151;">Your <strong>${planName}</strong> plan renews on <strong>${fmt(due)}</strong>, in ${daysToDue} day${daysToDue === 1 ? "" : "s"}.</p>
            <p style="font-size:15px;color:#374151;">To keep your plan active, send your renewal by bank transfer before that date. Reply to this email and we will send the bank details and your reference. Card payment is coming soon.</p>
            <div style="margin:24px 0;"><a href="${APP_URL}/billing" style="background:#059669;color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">View your billing</a></div>`),
          NOTIFY_TO);
        results.pre++;
      } else if (target === "due") {
        await sendEmail(email, `Your ${planName} plan renewal is due`,
          shell(`<p style="font-size:16px;margin-top:0;">Hi ${p.full_name || "there"},</p>
            <p style="font-size:15px;color:#374151;">Your <strong>${planName}</strong> plan renewal was due on <strong>${fmt(due)}</strong>. Send your renewal by bank transfer to keep your plan active. Reply for the bank details and your reference.</p>
            <div style="margin:24px 0;"><a href="${APP_URL}/billing" style="background:#059669;color:white;padding:11px 22px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">View your billing</a></div>`),
          NOTIFY_TO);
        await sendEmail(NOTIFY_TO, `Renewal due: ${email} (${planName})`,
          shell(`<p style="font-size:15px;color:#374151;">${p.full_name || email}'s ${planName} plan was due on ${fmt(due)}. Watch for the transfer, then Mark renewed on the Subscriptions screen.</p>`), email);
        results.due++;
      } else if (target === "overdue") {
        await sendEmail(email, `Action needed: your ${planName} plan is overdue`,
          shell(`<p style="font-size:16px;margin-top:0;">Hi ${p.full_name || "there"},</p>
            <p style="font-size:15px;color:#374151;">Your <strong>${planName}</strong> plan renewal was due on <strong>${fmt(due)}</strong> and we have not received it yet. Your access continues for now. Please send your renewal soon, or reply if anything has changed.</p>`),
          NOTIFY_TO);
        await sendEmail(NOTIFY_TO, `Overdue: ${email} (${planName})`,
          shell(`<p style="font-size:15px;color:#374151;">${p.full_name || email}'s ${planName} plan has been overdue since ${fmt(due)}. Decide whether to chase, pause or wait. No automatic action was taken.</p>`), email);
        results.overdue++;
      }

      await supabase.from("profiles").update({ renewal_reminder_stage: target }).eq("id", p.id);
    } catch {
      results.errors++;
    }
  }

  return results;
}
