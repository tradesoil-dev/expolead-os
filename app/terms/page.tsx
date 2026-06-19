import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ExpoLead OS",
  description: "Terms and conditions for using ExpoLead OS.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to home</Link>

        <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 19 June 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of terms</h2>
            <p>By creating an account or using ExpoLead OS, you agree to these Terms of Service. If you do not agree, do not use the service. These terms form a binding agreement between you and Tradesoil International (operator of ExpoLead OS).</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. The service</h2>
            <p>ExpoLead OS is a cloud-based exhibition lead management platform. We provide tools to capture, track and manage business connections and opportunities from trade exhibitions. The service is provided on a subscription basis following a free trial period.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Free trial</h2>
            <p>New accounts receive a 14-day free trial with full access to all Starter plan features. No payment is required during the trial. At the end of the trial, access to certain features will be restricted unless you subscribe to a paid plan. We do not automatically charge you — you must actively choose to subscribe.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Subscriptions and payments</h2>
            <p>Paid plans are billed monthly. Prices are displayed on our <Link href="/pricing" className="text-emerald-600 hover:underline">Pricing page</Link>. All prices are in USD. Payments are processed securely via Stripe. We do not store your payment card details. Subscriptions can be cancelled at any time — cancellation takes effect at the end of the current billing period.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Your data</h2>
            <p>You own all business data you enter into ExpoLead OS — your connections, opportunities, notes and records. We do not claim any rights over your data. You may export your data at any time using the CSV export feature. Upon account deletion, your data will be removed within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to other users' data.</li>
              <li>Reverse engineer, copy or resell the service.</li>
              <li>Use automated tools to abuse the service or its APIs.</li>
              <li>Enter false, misleading or harmful content into the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Service availability</h2>
            <p>We aim to provide reliable uptime but do not guarantee uninterrupted access. We may perform maintenance, updates or experience outages. We will communicate planned downtime where possible. We are not liable for losses arising from service interruptions.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">8. Limitation of liability</h2>
            <p>ExpoLead OS is provided "as is". To the maximum extent permitted by law, Tradesoil International is not liable for any indirect, incidental or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">9. Termination</h2>
            <p>You may cancel your account at any time by contacting us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">10. Changes to terms</h2>
            <p>We may update these terms as the product evolves. We will notify active users by email for material changes. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">11. Governing law</h2>
            <p>These terms are governed by the laws of Singapore. Any disputes shall be subject to the exclusive jurisdiction of the courts of Singapore.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">12. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
          </section>

        </div>
      </div>
    </main>
  );
}
