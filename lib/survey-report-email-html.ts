import { buildReport } from "@/lib/survey-report";
import type { Answers } from "@/lib/survey-v2";

// Builds the post-show report email (subject + HTML) without sending. Pure,
// so Admin can preview the exact email in the browser; the sender lives in
// lib/survey-report-email.ts. Same branded layout as the other ExpoLead
// emails and the same sections as the on-screen report. Charts are PNG images
// from /api/report-chart (email clients do not render the page SVG); their
// links carry only scores, and each has a text line in case images are
// blocked. All interpolated values are HTML-escaped.

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://expoleados.com";

const LEVEL_BG = { red: "#fff1f2", amber: "#fffbeb", green: "#ecfdf5" } as const;
const LEVEL_FG = { red: "#be123c", amber: "#b45309", green: "#047857" } as const;

export type SurveyReportEmailOpts = {
  firstName: string;
  company: string;
  exhibition: string;
  campaignLabel: string;
  answers: Answers;
};

export function buildSurveyReportEmail(opts: SurveyReportEmailOpts) {
  const r = buildReport(opts.answers, opts.exhibition);
  const name = esc((opts.firstName || "there").trim() || "there");
  const show = esc(opts.campaignLabel);

  const stat = (k: string, v: string, s: string) => `
              <td width="50%" valign="top" style="padding:6px;">
                <div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;">
                  <div style="font-size:12px;color:#94a3b8;font-weight:600;">${esc(k)}</div>
                  <div style="font-size:20px;color:#0f172a;font-weight:800;margin-top:4px;">${esc(v)}</div>
                  <div style="font-size:12px;color:#94a3b8;margin-top:2px;line-height:1.4;">${esc(s)}</div>
                </div>
              </td>`;

  let middle = "";
  if (r.kind === "exhibitor") {
    const stats = [
      r.perContact ? stat("Each contact cost you", r.perContact.value, r.perContact.sub) : "",
      r.atRisk ? stat("Contacts at risk", r.atRisk.value, r.atRisk.sub) : "",
    ].filter(Boolean);
    middle += stats.length ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr>${stats.join("")}</tr></table>` : "";
    const a = opts.answers;
    const chart = (title: string, sub: string, q: string, w: number, h: number, alt: string, after = "") => `
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 14px;">
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${esc(title)}</div>
              <div style="font-size:12px;color:#94a3b8;margin:2px 0 10px;line-height:1.5;">${esc(sub)}</div>
              <img src="${SITE}/api/report-chart?${q}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;margin:0 auto;" />
              ${after}
            </div>`;
    const scores = r.habits.map((h) => h.score).join("");
    middle += chart(
      "Your post-show habits", "Scored from your answers. The fuller the shape, the stronger the habit.",
      `k=radar&s=${scores}`, 340, 240,
      `Habit scores: ${r.habits.map((h) => `${h.name} ${h.score} of 3`).join(", ")}`,
      `<div style="font-size:14px;color:#475569;margin-top:8px;">${r.weak.length ? `Biggest gaps: <strong style="color:#0f172a;">${esc(r.weak.join(", "))}</strong>.` : "No weak spots in your answers. Strong habits."}</div>`,
    );
    if (r.funnel) {
      middle += chart(
        "Where your contacts stand", "From your own estimate of missed follow-ups.",
        `k=bars&c=${encodeURIComponent(String(a.count ?? ""))}&l=${encodeURIComponent(String(a.lost ?? ""))}`, 520, 180,
        `Contacts made: ${r.funnel.made}. May never hear from you: ${r.funnel.lostLabel}.`,
      );
    }
    middle += chart(
      "How quickly conversations go cold", "Illustration: the longer you wait to follow up, the more interest fades.",
      `k=curve&sp=${encodeURIComponent(r.speed?.key ?? "")}`, 300, 200,
      r.speed ? `Your first follow-up: ${r.speed.label}` : "Cooling curve illustration",
    );
    if (r.spend) {
      middle += `
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 18px;">
              <table cellpadding="0" cellspacing="0" width="100%"><tr>
                <td width="110" valign="middle"><img src="${SITE}/api/report-chart?k=donut&p=${Math.round(r.spend.share * 100)}&plus=${a.lost === "m" ? 1 : 0}" width="96" height="96" alt="${esc(r.spend.pct)} of show spend at risk" style="display:block;width:96px;height:96px;border:0;" /></td>
                <td valign="middle" style="padding-left:12px;">
                  <div style="font-size:15px;font-weight:600;color:#0f172a;">Show spend at risk</div>
                  <div style="font-size:20px;font-weight:800;color:#0f172a;margin:4px 0;">${esc(r.spend.value)}</div>
                  <div style="font-size:12px;color:#94a3b8;line-height:1.5;">${esc(r.spend.sub)}</div>
                </td>
              </tr></table>
            </div>`;
    }
    middle += `<p style="margin:0 0 10px;font-size:16px;font-weight:600;color:#0f172a;">Your next 7 days</p>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 12px;">${r.plan
              .map(([d, t]) => `<tr><td width="64" valign="top" style="padding:0 0 10px;font-size:13px;font-weight:700;color:#047857;">${esc(d)}</td><td style="padding:0 0 10px;font-size:14px;line-height:1.6;color:#475569;">${esc(t)}</td></tr>`)
              .join("")}</table>`;
    if (r.nextTip) {
      middle += `<div style="background:#fef9c3;border-radius:10px;padding:12px 14px;margin:0 0 20px;font-size:14px;line-height:1.6;color:#713f12;"><strong>For your next show:</strong> ${esc(r.nextTip)}</div>`;
    }
  } else {
    // Visitors: same structure, built from their own answers.
    middle += `<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr>${stat("Exhibitors you had serious talks with", r.talks, "Your answer")}${stat("How you track suppliers", r.tracked, "Your answer")}</tr></table>`;
    const box = (title: string, sub: string, q: string, w: number, h: number, alt: string) => `
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 14px;">
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${esc(title)}</div>
              <div style="font-size:12px;color:#94a3b8;margin:2px 0 10px;line-height:1.5;">${esc(sub)}</div>
              <img src="${SITE}/api/report-chart?${q}" width="${w}" height="${h}" alt="${esc(alt)}" style="display:block;width:100%;max-width:${w}px;height:auto;border:0;margin:0 auto;" />
            </div>`;
    middle += `
            <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:0 0 14px;">
              <div style="font-size:15px;font-weight:600;color:#0f172a;">Your sourcing snapshot</div>
              <div style="font-size:12px;color:#94a3b8;margin:2px 0 10px;line-height:1.5;">Scored from your answers. The fuller the shape, the stronger your follow-through.</div>
              <img src="${SITE}/api/report-chart?k=vradar&s=${r.habits.map((h) => h.score).join("")}" width="340" height="260" alt="${esc(r.habits.map((h) => `${h.name} ${h.score} of 3`).join(", "))}" style="display:block;width:100%;max-width:340px;height:auto;border:0;margin:0 auto;" />
              <div style="font-size:14px;color:#475569;margin-top:8px;">${r.weak.length ? `Biggest gaps: <strong style="color:#0f172a;">${esc(r.weak.join(", "))}</strong>.` : "No weak spots in your answers. Strong habits."}</div>
            </div>`;
    middle += box(
      "Follow-ups on both sides", "From your answers. Both sides need to follow up for a deal to happen.",
      `k=vbars&t=${encodeURIComponent(r.theirs.key)}&y=${encodeURIComponent(r.yours.key)}`, 520, 130,
      `Exhibitors who followed up with you: ${r.theirs.label}. Exhibitors you followed up with: ${r.yours.label}.`,
    );
    middle += box("How quickly conversations go cold", "Illustration: the longer you wait to follow up, the more interest fades.", "k=curve", 300, 200, "Illustration of interest fading after the show");
    middle += `<p style="margin:0 0 10px;font-size:16px;font-weight:600;color:#0f172a;">Your next 7 days</p>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 12px;">${r.plan
              .map(([d, t]) => `<tr><td width="64" valign="top" style="padding:0 0 10px;font-size:13px;font-weight:700;color:#047857;">${esc(d)}</td><td style="padding:0 0 10px;font-size:14px;line-height:1.6;color:#475569;">${esc(t)}</td></tr>`)
              .join("")}</table>`;
    if (r.nextTip) {
      middle += `<div style="background:#fef9c3;border-radius:10px;padding:12px 14px;margin:0 0 20px;font-size:14px;line-height:1.6;color:#713f12;"><strong>For your next show:</strong> ${esc(r.nextTip)}</div>`;
    }
  }

  return {
    subject: `Your ${opts.campaignLabel} post-show report`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#ecfdf5;padding:26px 40px;border-bottom:1px solid #d1fae5;">
            <img src="https://expoleados.com/email-logo-new.png" width="200" height="50" alt="expolead os" style="display:block;width:200px;height:50px;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 28px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#047857;">Post-show report</p>
            <p style="margin:0 0 20px;font-size:22px;font-weight:800;color:#0f172a;">${show}</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569;">Hi ${name}, thank you for taking the ${show} post-show check. Here is a copy of your report.</p>
            <div style="background:${LEVEL_BG[r.level]};border-radius:12px;padding:16px 18px;margin:0 0 16px;">
              <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${LEVEL_FG[r.level]};">${esc(r.badge)}</div>
              <div style="font-size:18px;font-weight:700;color:#0f172a;margin-top:4px;">${esc(r.head)}</div>
              <div style="font-size:14px;line-height:1.6;color:#475569;margin-top:4px;">${esc(r.body)}</div>
            </div>
            ${middle}
            <p style="margin:0 0 10px;font-size:16px;font-weight:600;color:#0f172a;">Every show, one workspace</p>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569;">ExpoLead OS keeps every contact, conversation and follow-up from each exhibition in one place you open every morning, and shows what each show brought in.</p>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="border-radius:10px;background:#059669;"><a href="https://www.linkedin.com/company/expolead-os/" style="display:inline-block;padding:11px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Follow ExpoLead OS on LinkedIn</a></td>
              <td width="10"></td>
              <td style="border-radius:10px;border:1px solid #059669;"><a href="https://expoleados.com/features" style="display:inline-block;padding:10px 20px;font-size:14px;font-weight:600;color:#047857;text-decoration:none;border-radius:10px;">See how it works</a></td>
            </tr></table>
            <p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">This report is a self-check built only from your answers.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Questions? Just reply to this email.</p>
            <p style="margin:0;font-size:13px;color:#94a3b8;">Gladwin and Gayan, Founders of ExpoLead OS</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  };
}
