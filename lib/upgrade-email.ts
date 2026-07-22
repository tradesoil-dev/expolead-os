import { Resend } from "resend";

const NOTIFY_TO = "hello.expolead@tradesoil.com";

type Details = {
  customerEmail: string;
  customerName?: string | null;
  plan: string;
  billingCycle: string;
  amountUsd: number;
  reference: string;
};

/**
 * Tells Gladwin somebody wants to pay. Sent when a user submits the in-app
 * upgrade form. Until a payment gateway exists this email IS the sales
 * pipeline, so it carries everything needed to match a bank transfer and
 * grant access without opening the app.
 */
/**
 * Sent when the customer presses "I have made the payment". This is the one
 * that should make Gladwin go and check the bank, so it is deliberately
 * louder than the initial interest email.
 */
export async function sendPaymentClaimedEmail(d: Details) {
  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY not configured" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const planLabel = d.plan.charAt(0).toUpperCase() + d.plan.slice(1);

  return resend.emails.send({
    from: "ExpoLead OS <hello.expolead@tradesoil.com>",
    to: NOTIFY_TO,
    replyTo: d.customerEmail,
    subject: `Payment sent ${d.reference}, check the bank. ${planLabel} ${d.billingCycle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <div style="background: #0f172a; padding: 20px 28px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 18px;">A customer says they have paid</h1>
        </div>
        <div style="padding: 24px 28px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 15px; color: #374151; margin-top: 0;">Check your bank for a transfer quoting <strong>${d.reference}</strong>.</p>
          <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b;">Reference</td><td style="padding: 6px 0; font-weight: bold;">${d.reference}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer</td><td style="padding: 6px 0;">${d.customerName || "—"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;">${d.customerEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Plan</td><td style="padding: 6px 0;">${planLabel}, ${d.billingCycle}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Amount</td><td style="padding: 6px 0; font-weight: bold;">USD ${d.amountUsd.toFixed(2)}</td></tr>
          </table>
          <p style="font-size: 15px; color: #374151; margin-top: 20px;">When it lands, grant their access and reply to confirm. They are waiting on you.</p>
          <p style="font-size: 13px; color: #6b7280;">Replying to this email goes straight to the customer.</p>
        </div>
      </div>`,
  });
}

export async function sendUpgradeRequestEmail(d: Details) {
  if (!process.env.RESEND_API_KEY) {
    return { error: "RESEND_API_KEY not configured" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const planLabel = d.plan.charAt(0).toUpperCase() + d.plan.slice(1);

  return resend.emails.send({
    from: "ExpoLead OS <hello.expolead@tradesoil.com>",
    to: NOTIFY_TO,
    replyTo: d.customerEmail,
    subject: `Upgrade request ${d.reference}, ${planLabel} ${d.billingCycle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
        <div style="background: #059669; padding: 20px 28px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 18px;">Someone wants to upgrade</h1>
        </div>
        <div style="padding: 24px 28px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #64748b;">Reference</td><td style="padding: 6px 0; font-weight: bold;">${d.reference}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Customer</td><td style="padding: 6px 0;">${d.customerName || "—"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0;">${d.customerEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Plan</td><td style="padding: 6px 0;">${planLabel}, ${d.billingCycle}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Amount</td><td style="padding: 6px 0; font-weight: bold;">USD ${d.amountUsd.toFixed(2)}</td></tr>
          </table>
          <p style="font-size: 14px; color: #374151; margin-top: 20px;">Check your bank for a transfer quoting <strong>${d.reference}</strong>. Once it lands, grant their access and reply to confirm.</p>
          <p style="font-size: 13px; color: #6b7280;">Replying to this email goes straight to the customer.</p>
        </div>
      </div>`,
  });
}
