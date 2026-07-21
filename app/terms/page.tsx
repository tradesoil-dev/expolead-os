import Link from "next/link";

export const metadata = {
  title: "Terms of Service — ExpoLead OS",
  description: "Terms and conditions for using ExpoLead OS. 14-day free trial, no credit card required. Your data is yours — export it anytime. Cancel anytime.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* HEADER */}
      <header className="flex items-center justify-between bg-slate-800 px-6 py-4 lg:px-16">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid grid-cols-2 gap-[3.5px] shrink-0">
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] border-[1.8px] border-white" />
            <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500" />
          </div>
          <span className="flex items-center text-[16px] tracking-tight leading-none">
            <span className="font-semibold text-white">Expo</span>
            <span className="font-semibold text-emerald-400">Lead</span>
            <span className="font-normal text-slate-400"> OS</span>
          </span>
        </Link>
        <span className="text-sm font-semibold text-emerald-400">Terms of Service</span>
      </header>

      <div className="px-6 py-16 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to home</Link>

        <p className="mt-4 text-sm text-slate-500">Last updated: 21 July 2026</p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">1. Acceptance of terms</h2>
            <p>By creating an account or using ExpoLead OS, you agree to these Terms of Service. If you do not agree, do not use the service. These terms form a binding agreement between you and ExpoLead OS.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">2. The service</h2>
            <p>ExpoLead OS is a cloud-based exhibition lead management platform. We provide tools to capture, track and manage business connections and opportunities from trade exhibitions. The service is provided on a subscription basis following a free trial period.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">3. Free trial</h2>
            <p>New accounts receive a 14-day free trial. The trial covers one exhibition, up to 25 connections and up to 25 opportunities, and does not include CSV export, which is a paid feature. No payment is required during the trial. At the end of the trial you keep full access to view and edit everything you captured, but you cannot add new records unless you subscribe to a paid plan. We do not automatically charge you — you must actively choose to subscribe.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">4. Subscriptions and payments</h2>
            <p>Paid plans are billed monthly or annually, in USD, at the prices shown on our <Link href="/pricing" className="text-emerald-600 hover:underline">Pricing page</Link>. Annual billing is offered as a convenience and is charged at twelve times the monthly price; it is not a discounted rate.</p>
            <p className="mt-3">Payments are handled by our third-party payment provider. Their name appears at checkout and may be the name that shows on your card or bank statement. We never see or store your full card details.</p>
            <p className="mt-3">Subscriptions renew automatically at the end of each billing period, monthly or annually, until you cancel. You may cancel at any time. Cancellation stops the next renewal and takes effect at the end of the period you have already paid for, so you keep access until then. We will give you at least 30 days notice by email before any price change affects your subscription.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">5. Refunds</h2>
            <p>If you are not happy with ExpoLead OS, email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a> within 14 days of your payment and we will refund you in full. No questions asked.</p>
            <p className="mt-3">This applies to your first payment on a plan and to each renewal. Refunds are returned to the original payment method and are normally processed within 5 to 10 business days, depending on your bank. Every account starts with a free trial, so we encourage you to use it fully before paying.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">6. Your data</h2>
            <p>You own all business data you enter into ExpoLead OS — your connections, opportunities, notes and records. We do not claim any rights over your data. On any paid plan you may export your data at any time using the CSV export feature. Upon account deletion, your data will be removed within 30 days.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">7. Acceptable use</h2>
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
            <h2 className="text-base font-bold text-slate-900 mb-2">8. Service availability</h2>
            <p>We aim to provide reliable uptime but do not guarantee uninterrupted access. We may perform maintenance, updates or experience outages. We will communicate planned downtime where possible. We are not liable for losses arising from service interruptions.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">9. Limitation of liability</h2>
            <p>ExpoLead OS is provided "as is". To the maximum extent permitted by law, ExpoLead OS is not liable for any indirect, incidental or consequential damages arising from your use of the service. Our total liability to you shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">10. Termination</h2>
            <p>You may cancel your account at any time by contacting us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">11. Changes to terms</h2>
            <p>We may update these terms as the product evolves. We will notify active users by email for material changes. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">12. Governing law</h2>
            <p>These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka. Any dispute arising from these terms or your use of ExpoLead OS shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.</p>
            <p className="mt-3">If you are a consumer resident elsewhere, this does not remove any protection you have under the mandatory laws of your country of residence.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">13. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
          </section>

        </div>
      </div>
      </div>
    </main>
  );
}
