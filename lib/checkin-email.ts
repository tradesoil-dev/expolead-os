import { Resend } from "resend";

// Post-show check-in email: a short survey link first, then a step-by-step
// guide to bring the show's leads into ExpoLead OS, then why ExpoLead OS adds
// the most value during the show itself. Same branded layout as the invite
// email. All interpolated values are HTML-escaped (the name comes from a
// user-editable profile field).

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function step(n: number, title: string, body: string) {
  return `
                  <tr>
                    <td width="34" valign="top"><div style="width:24px;height:24px;border-radius:12px;background:#059669;color:#ffffff;font-size:13px;font-weight:700;text-align:center;line-height:24px;">${n}</div></td>
                    <td style="padding:0 0 16px;font-size:14px;line-height:1.6;color:#475569;"><strong style="color:#0f172a;">${title}</strong> ${body}</td>
                  </tr>`;
}

export async function sendCheckinEmail(opts: {
  email: string;
  firstName: string;
  exhibition: string;
  surveyUrl: string;
  appUrl: string;
  accessUntilLabel: string;
  // True when the account has captured nothing yet; changes one paragraph.
  notUsedYet: boolean;
}) {
  const name = esc((opts.firstName || "there").trim() || "there");
  const show = esc(opts.exhibition);
  const resend = new Resend(process.env.RESEND_API_KEY);

  const usageLine = opts.notUsedYet
    ? "We noticed you have not had the chance to use ExpoLead OS yet, and that is completely fine. Show days are busy. Every exhibitor handles leads differently, and we would love to learn how you do it today."
    : "Every exhibitor handles leads differently, and we would love to learn how the show went for you and how you handle your leads today.";

  return resend.emails.send({
    from: "Gladwin & Gayan at ExpoLead OS <hello@expoleados.com>",
    to: opts.email,
    subject: `How did ${opts.exhibition} go? 3 minutes of your feedback`,
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
          <td style="padding:40px 40px 8px;">
            <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name}, how did ${show} go?</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
              Congratulations on the show. We hope it brought you strong conversations and new buyers.
            </p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
              ${usageLine}
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#475569;">
              It takes about 3 minutes, mostly tapping answers, and no sign in is needed. At the end you get a personal post-show report. Your answers will directly shape what we build next.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
              <tr>
                <td style="border-radius:10px;background:#059669;">
                  <a href="${opts.surveyUrl}" style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Take the 3 minute survey</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:12px;">
              <tr><td style="padding:24px 24px 8px;">
                <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#0f172a;">Your ${show} leads still have value</p>
                <p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#475569;">The cards and notes you brought back can still go into ExpoLead OS. One evening is enough:</p>

                <table cellpadding="0" cellspacing="0" width="100%">${step(
                  1,
                  `Add ${show}.`,
                  "Go to Exhibitions, search for it, pick it from the list and save. Add what the show cost you, and Reports will show what it returned.",
                )}${step(
                  2,
                  "Scan your business cards.",
                  "Go to Connections, Add connection, then Scan a business card. The details fill in for you. Then add what you discussed with that buyer: type it into Notes, or tap Record conversation and read out what you wrote down at the show as a quick voice note.",
                )}${step(
                  3,
                  "Set follow-up dates.",
                  "Your Follow-ups list then tells you who to contact first, so no buyer goes cold.",
                )}${step(
                  4,
                  "Track your hot leads.",
                  `Log sample, quotation and order requests as Opportunities and see what ${show} brings to your business.`,
                )}
                </table>

                <table cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">
                  <tr>
                    <td style="border-radius:10px;border:1px solid #059669;background:#ffffff;">
                      <a href="${opts.appUrl}" style="display:inline-block;padding:11px 24px;font-size:14px;font-weight:600;color:#047857;text-decoration:none;border-radius:10px;">Open ExpoLead OS</a>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 28px;">
            <p style="margin:0 0 10px;font-size:16px;font-weight:600;color:#0f172a;">Where ExpoLead OS adds the most value</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#475569;">
              Bringing your leads in after the show is a good start, but ExpoLead OS does its best work during the show itself. At the booth you scan the buyer's card, record your actual conversation with them (with their permission), and set the follow-up, all in about a minute. Nothing depends on memory or scribbled notes.
            </p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              Before, during and after every exhibition, you see every connection, conversation and opportunity in one place, and exactly what each show brings to your business. Your next exhibition is where it will make the biggest difference.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:0 40px 36px;">
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              Your full access runs until <strong>${esc(opts.accessUntilLabel)}</strong>. If it helps, we are happy to do a 15 minute call and set it up with you. Just reply to this email.
            </p>
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
  });
}
