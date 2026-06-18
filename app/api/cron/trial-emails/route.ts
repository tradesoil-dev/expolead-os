import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// This route is called daily by Vercel Cron (see vercel.json).
// It sends trial lifecycle emails via Resend at day 7, day 1, and day 0 (expiry).

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://expolead-os.vercel.app";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ExpoLead OS <noreply@tradesoil.com>",
      to,
      subject,
      html,
    }),
  });
  return res.ok;
}

function emailDay7(name: string, trialEndDate: string) {
  const displayName = name || "there";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="background: #059669; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">ExpoLead OS</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
        <p style="font-size: 15px; color: #374151;">Your free trial ends in <strong>7 days</strong> on <strong>${trialEndDate}</strong>.</p>
        <p style="font-size: 15px; color: #374151;">Everything you have added — connections, opportunities, and exhibitions — stays in your account. After the trial ends you can still view and export all your data.</p>
        <p style="font-size: 15px; color: #374151;">To keep adding new records and stay on top of your leads, choose a plan before your trial ends.</p>
        <div style="margin: 28px 0;">
          <a href="${APP_URL}/pricing" style="background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">View Plans</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Questions? Just reply to this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">ExpoLead OS &mdash; tradesoil.com</p>
      </div>
    </div>`;
}

function emailDay1(name: string, trialEndDate: string) {
  const displayName = name || "there";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="background: #d97706; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">ExpoLead OS</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
        <p style="font-size: 15px; color: #374151;">Your free trial ends <strong>tomorrow</strong> on <strong>${trialEndDate}</strong>.</p>
        <p style="font-size: 15px; color: #374151;">After that, adding new connections, opportunities, and exhibitions will be paused until you upgrade. Your existing data and CSV export will always be available.</p>
        <p style="font-size: 15px; color: #374151;">If ExpoLead OS has helped you stay on top of your exhibition leads, now is a good time to continue with a plan.</p>
        <div style="margin: 28px 0;">
          <a href="${APP_URL}/pricing" style="background: #d97706; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">Choose a Plan</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Questions? Just reply to this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">ExpoLead OS &mdash; tradesoil.com</p>
      </div>
    </div>`;
}

function emailExpired(name: string) {
  const displayName = name || "there";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
      <div style="background: #0f172a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">ExpoLead OS</h1>
      </div>
      <div style="padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; margin-top: 0;">Hi ${displayName},</p>
        <p style="font-size: 15px; color: #374151;">Your 14-day free trial has ended.</p>
        <p style="font-size: 15px; color: #374151;">Here is what you can still do:</p>
        <ul style="font-size: 15px; color: #374151; padding-left: 20px; line-height: 1.8;">
          <li>View all your connections, opportunities, and exhibitions</li>
          <li>Export your data to CSV at any time</li>
          <li>Access your account settings</li>
        </ul>
        <p style="font-size: 15px; color: #374151;">To continue adding new records, choose a plan. Your data is waiting for you exactly as you left it.</p>
        <div style="margin: 28px 0;">
          <a href="${APP_URL}/pricing" style="background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">See Plans and Pricing</a>
        </div>
        <p style="font-size: 13px; color: #6b7280;">Questions? Just reply to this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af; margin: 0;">ExpoLead OS &mdash; tradesoil.com</p>
      </div>
    </div>`;
}

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!RESEND_API_KEY || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const now = new Date();

  // Day 7 window: trial ends between 6.5 and 7.5 days from now
  const day7Start = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000).toISOString();
  const day7End = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000).toISOString();

  // Day 1 window: trial ends between 0.5 and 1.5 days from now
  const day1Start = new Date(now.getTime() + 0.5 * 24 * 60 * 60 * 1000).toISOString();
  const day1End = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000).toISOString();

  // Expired window: trial ended in the last 24 hours
  const expiredStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const expiredEnd = now.toISOString();

  const results = { day7: 0, day1: 0, expired: 0, errors: 0 };

  // Fetch user emails from auth.users via service role
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const emailMap: Record<string, string> = {};
  if (authUsers?.users) {
    for (const u of authUsers.users) {
      if (u.email) emailMap[u.id] = u.email;
    }
  }

  async function processGroup(
    start: string,
    end: string,
    type: "day7" | "day1" | "expired"
  ) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, trial_ends_at")
      .eq("subscription_status", "trialing")
      .gte("trial_ends_at", start)
      .lte("trial_ends_at", end);

    if (!profiles) return;

    for (const profile of profiles) {
      const email = emailMap[profile.id];
      if (!email) continue;

      const trialEndDate = new Date(profile.trial_ends_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
      });

      let html = "";
      let subject = "";

      if (type === "day7") {
        subject = "Your ExpoLead OS trial ends in 7 days";
        html = emailDay7(profile.full_name, trialEndDate);
      } else if (type === "day1") {
        subject = "Your ExpoLead OS trial ends tomorrow";
        html = emailDay1(profile.full_name, trialEndDate);
      } else {
        subject = "Your ExpoLead OS trial has ended";
        html = emailExpired(profile.full_name);
      }

      const ok = await sendEmail(email, subject, html);
      if (ok) results[type]++;
      else results.errors++;
    }
  }

  await processGroup(day7Start, day7End, "day7");
  await processGroup(day1Start, day1End, "day1");
  await processGroup(expiredStart, expiredEnd, "expired");

  return NextResponse.json({ ok: true, sent: results });
}
