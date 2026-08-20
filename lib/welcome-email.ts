import { Resend } from "resend";

// Sends the trial welcome email via Resend. Called once per user, after their
// email is confirmed (from the app layout), not at signup.
export async function sendWelcomeEmail(email: string, firstName: string) {
  const name = (firstName || "there").trim() || "there";
  const resend = new Resend(process.env.RESEND_API_KEY);

  return resend.emails.send({
    from: "Gladwin & Gayan at ExpoLead OS <hello.expolead@tradesoil.com>",
    to: email,
    subject: "Welcome to ExpoLead OS, your trial has started",
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
            <p style="margin:0 0 24px;font-size:18px;font-weight:600;color:#0f172a;">Hey ${name}, welcome aboard!</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#475569;">
              Your 14-day free trial of ExpoLead OS has started. You now have full access to capture connections, create opportunities, and manage your exhibition pipeline.
            </p>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#475569;">
              Here are two things to do right now to get the most out of your trial:
            </p>

            <!-- Tips -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
              <tr>
                <td style="background:#f0fdf4;border-left:3px solid #10b981;border-radius:6px;padding:16px 20px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#10b981;text-transform:uppercase;letter-spacing:0.05em;">Step 1</p>
                  <p style="margin:0;font-size:14px;color:#0f172a;font-weight:500;">Add your first connection</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Go to Connections and add someone you met at a recent exhibition: name, company, what you discussed.</p>
                </td>
              </tr>
              <tr><td style="height:10px;"></td></tr>
              <tr>
                <td style="background:#f0fdf4;border-left:3px solid #10b981;border-radius:6px;padding:16px 20px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#10b981;text-transform:uppercase;letter-spacing:0.05em;">Step 2</p>
                  <p style="margin:0;font-size:14px;color:#0f172a;font-weight:500;">Log an opportunity</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Under Opportunities, track a deal or follow-up in progress: stage, value, next action.</p>
                </td>
              </tr>
            </table>
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
