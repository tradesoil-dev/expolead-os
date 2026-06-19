import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — ExpoLead OS",
  description: "How ExpoLead OS collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to home</Link>

        <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 19 June 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Who we are</h2>
            <p>ExpoLead OS is a product of Tradesoil International, operated by Gladwin Gerald. Our registered contact email is <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>. References to "we", "us" or "our" in this policy refer to ExpoLead OS / Tradesoil International.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. What data we collect</h2>
            <p>We collect only what is necessary to provide the service:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Account data:</strong> your email address and password (hashed — we never store plain-text passwords).</li>
              <li><strong>Profile data:</strong> your name if you choose to provide it.</li>
              <li><strong>Business data you enter:</strong> exhibition connections, opportunities, notes, and follow-up records you create inside the app.</li>
              <li><strong>Usage data:</strong> basic logs of actions taken within the app for security and debugging purposes.</li>
            </ul>
            <p className="mt-3">We do not collect payment card details directly. When Stripe is integrated (V1.3), payments are handled entirely by Stripe and governed by their privacy policy.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. How we use your data</h2>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>To provide and operate the ExpoLead OS service.</li>
              <li>To send transactional emails — account confirmation, welcome email, trial expiry notices.</li>
              <li>To enforce trial and subscription limits.</li>
              <li>To respond to support requests you initiate.</li>
            </ul>
            <p className="mt-3">We do not sell your data. We do not use your data for advertising. We do not share your business data with third parties except as described below.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Data isolation and security</h2>
            <p>Your data is strictly isolated. Each user account can only access its own data — this is enforced at the database level using Row Level Security (RLS) policies. No other user can view, access or modify your records.</p>
            <p className="mt-3">All data is encrypted in transit (HTTPS/TLS) and at rest. Authentication is managed by Supabase, an industry-standard platform used by thousands of production applications worldwide.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Third-party services</h2>
            <p>We use the following trusted third-party services to operate ExpoLead OS:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong>Supabase</strong> — database, authentication and storage (hosted on AWS us-east-1).</li>
              <li><strong>Vercel</strong> — application hosting and deployment.</li>
              <li><strong>Resend</strong> — transactional email delivery.</li>
            </ul>
            <p className="mt-3">Each of these providers maintains their own security and privacy standards. We do not grant them access to your business data beyond what is technically required to deliver the service.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Data retention</h2>
            <p>Your data is retained for as long as your account is active. If you close your account, we will delete your personal data and business records within 30 days upon request. Email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a> to request deletion.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Your rights</h2>
            <p>You have the right to access, correct, export or delete your personal data at any time. To exercise any of these rights, contact us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>. We will respond within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">8. Cookies</h2>
            <p>ExpoLead OS uses only essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies or third-party analytics cookies.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">9. Changes to this policy</h2>
            <p>We may update this policy as the product evolves. We will notify active users by email for any material changes. The date at the top of this page reflects the most recent update.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">10. Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
