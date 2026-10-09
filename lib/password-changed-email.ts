import { Resend } from "resend";

// Security notification: tells the account owner their password was changed,
// so an unexpected change is noticed immediately. Branded to match the other
// ExpoLead emails.
export async function sendPasswordChangedEmail(email: string, firstName: string, sourceLabel: string) {
  const name = (firstName || "there").trim() || "there";
  const when = new Date().toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: "ExpoLead OS <hello@expoleados.com>",
    to: email,
    subject: "Your ExpoLead OS password was changed",
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
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 20px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${name}, your password was changed</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
              The password for your ExpoLead OS account (${email}) was changed on <strong>${when}</strong>, from ${sourceLabel}.
            </p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7;color:#475569;">
              If this was you, no action is needed.
            </p>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#475569;">
              If this was <strong>not</strong> you, reset your password immediately from the sign in page and reply to this email so we can help secure your account.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:13px;color:#94a3b8;">ExpoLead OS security notification</p>
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
