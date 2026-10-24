import { buildReport } from "@/lib/survey-report";
import type { Answers } from "@/lib/survey-v2";

// Builds the post-show report email (subject + HTML) without sending. Pure,
// so Admin can preview the exact email in the browser; the sender lives in
// lib/survey-report-email.ts. Same branded layout as the other
// ExpoLead emails. Numbers and the 7-day plan only: charts do not render
// reliably in email clients. All interpolated values are HTML-escaped.

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

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
    if (r.spend) {
      middle += `<p style="margin:8px 0 18px;font-size:15px;line-height:1.7;color:#475569;"><strong style="color:#0f172a;">Show spend at risk: ${esc(r.spend.value)}.</strong> ${esc(r.spend.sub)}</p>`;
    }
    if (r.weak.length) {
      middle += `<p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569;">Biggest gaps in your post-show habits: <strong style="color:#0f172a;">${esc(r.weak.join(", "))}</strong>.</p>`;
    }
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
