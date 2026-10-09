import { Resend } from "resend";

// Sends a pilot/customer invite via Resend, carrying a secure "set your own
// password" link generated server-side by Supabase. Branded to match the
// welcome and receipt emails. The user never receives a password; they set
// their own on first click.
export async function sendPilotInviteEmail(
  email: string,
  firstName: string,
  actionLink: string,
  accessUntilLabel: string,
) {
  const name = (firstName || "there").trim() || "there";
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: "Gladwin & Gayan at ExpoLead OS <hello@expoleados.com>",
    to: email,
    subject: "You have been given access to ExpoLead OS",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">

        <!-- Header -->
        <tr>
          <td style="background:#ecfdf5;padding:26px 40px;border-bottom:1px solid #d1fae5;">
            <img src="https://expoleados.com/email-logo-new.png" width="200" height="50" alt="expolead os" style="display:block;width:200px;height:50px;border:0;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name}, your ExpoLead OS access is ready</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
              You have been given full access to ExpoLead OS to use at your next exhibition. Capture every lead at the booth, keep your connections and follow-ups organised, and build a clear pipeline of the business each show creates.
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#475569;">
              Click below to set your password and sign in. Your access runs until <strong>${accessUntilLabel}</strong>.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
              <tr>
                <td style="border-radius:10px;background:#059669;">
                  <a href="${actionLink}" style="display:inline-block;padding:14px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">Set my password and start</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;line-height:1.7;color:#94a3b8;">
              If the button does not work, copy and paste this link into your browser:<br />
              <span style="color:#64748b;word-break:break-all;">${actionLink}</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
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
