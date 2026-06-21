import Link from "next/link";

export const metadata = {
  title: "Privacy Notice — ExpoLead OS",
  description: "How ExpoLead OS collects, uses and protects your personal data. We do not sell your data, use advertising cookies, or share your business records with third parties.",
};

export default function PrivacyPage() {
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
        <span className="text-sm font-semibold text-emerald-400">Privacy Notice</span>
      </header>

      {/* CONTENT */}
      <div className="px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-emerald-600 hover:underline">← Back to home</Link>

          <p className="mt-4 text-sm text-slate-500">Last updated: 20 June 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-7 text-slate-700">

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">About this notice</h2>
              <p>ExpoLead OS is a product of Tradesoil International. We built ExpoLead OS to help trade professionals manage their exhibition leads, buyers, suppliers, and opportunities in one place. This notice explains what information we collect when you use ExpoLead OS, how we use it, and what rights you have over your data.</p>
              <p className="mt-3">If you have any questions, contact us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">1. Who we are</h2>
              <p>ExpoLead OS is operated by Tradesoil International. We are the data controller, meaning we decide how and why your personal data is processed. We do not process data on behalf of any third party.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">2. What information we collect</h2>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li><strong>Account signup:</strong> Your email address and password. Your password is encrypted before storage and we never store or see your plain-text password. You may optionally provide your name.</li>
                <li><strong>Platform usage:</strong> Any business data you enter, including connections, buyers, suppliers, opportunities, exhibition records, notes, sample details, and follow-up records. This is your business data and you own it at all times.</li>
                <li><strong>Website visits:</strong> Basic technical information your browser sends automatically, such as your IP address, browser type, and operating system. We use this only for security monitoring and debugging.</li>
                <li><strong>What we do not collect:</strong> We do not collect sensitive personal data such as health information, financial account numbers, government ID numbers, or political views.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">3. Cookies</h2>
              <p>ExpoLead OS uses only essential cookies, the minimum required to keep you logged in and your session secure. We do not use advertising cookies, tracking cookies, or third-party analytics cookies. You do not need to accept or reject a cookie banner because we only use cookies that are strictly necessary to operate the service.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">4. How we use your information</h2>
              <p>We use the information we collect only to run ExpoLead OS for you. Specifically:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>To create and maintain your account</li>
                <li>To store and retrieve the business data you enter</li>
                <li>To send you transactional emails such as account confirmation, welcome email, trial expiry reminders, and security alerts</li>
                <li>To monitor for security issues and prevent fraud</li>
                <li>To respond to your support requests</li>
                <li>To comply with legal obligations if required</li>
              </ul>
              <p className="mt-3">We do not use your data for advertising. We do not sell your data. We do not share your data with marketing companies.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">5. Who we share your data with</h2>
              <p>We share your data only with the third-party services we use to operate ExpoLead OS:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li><strong>Supabase</strong> stores your account and business data (hosted on AWS infrastructure)</li>
                <li><strong>Vercel</strong> hosts and delivers the ExpoLead OS application</li>
                <li><strong>Resend</strong> sends transactional emails on our behalf</li>
              </ul>
              <p className="mt-3">Each provider receives only the minimum data needed to do their job. They are contractually required to keep your data confidential and cannot use it for their own purposes. We do not share your data with advertisers, data brokers, or partners.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">6. Legal requests</h2>
              <p>If a court, regulator, or law enforcement agency issues a valid legal order requiring us to disclose your data, we are legally obligated to comply. Where permitted by law, we will notify you before disclosing. We will only disclose what the order specifically requires and nothing more.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">7. How we protect your data</h2>
              <p>We take reasonable steps to keep your data secure:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li>All data is encrypted in transit using HTTPS</li>
                <li>Passwords are hashed and never stored in plain text</li>
                <li>Each user's data is strictly isolated, no other user can access yours</li>
                <li>Authentication is handled by Supabase, an industry-standard security platform</li>
              </ul>
              <p className="mt-3">No system is 100% secure. If you believe your account has been compromised, contact us immediately at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">8. International data transfers</h2>
              <p>ExpoLead OS is operated from Sri Lanka. Your data is stored on Supabase infrastructure hosted on AWS, which may be located in data centres outside your home country. By using ExpoLead OS, you acknowledge that your data may be processed internationally. We rely on the security and contractual commitments of our service providers to protect it during any such transfers.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">9. How long we keep your data</h2>
              <p>We keep your data for as long as your account is active. If you close your account and request deletion, we will permanently delete your personal data and business records within 30 days. We may retain certain information for longer only if required by law.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">10. Children</h2>
              <p>ExpoLead OS is a business tool intended for professionals aged 18 and above. We do not knowingly collect data from anyone under 18. If you believe someone under 18 has created an account, contact us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a> and we will delete the account.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">11. Third-party links</h2>
              <p>ExpoLead OS may contain links to external websites or services. We are not responsible for the privacy practices of those third parties. We recommend reading their privacy notices before sharing your data with them.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">12. Your rights</h2>
              <p>Depending on where you are located, you may have the right to:</p>
              <ul className="mt-3 space-y-2 list-disc list-inside">
                <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
                <li><strong>Correct</strong> — ask us to fix inaccurate or incomplete data</li>
                <li><strong>Delete</strong> — ask us to delete your personal data</li>
                <li><strong>Export</strong> — download your business data at any time using the CSV export feature inside the platform</li>
                <li><strong>Object</strong> — ask us to stop processing your data in certain circumstances</li>
                <li><strong>Withdraw consent</strong> — where we rely on consent, you can withdraw it at any time</li>
              </ul>
              <p className="mt-3">To exercise any of these rights, email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>. We will respond within 7 business days. We may ask you to verify your identity before processing your request.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">13. Changes to this notice</h2>
              <p>We may update this notice as ExpoLead OS grows or if legal requirements change. If we make significant changes, we will notify active users by email. The date at the top of this page always shows when it was last updated.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-slate-900 mb-2">14. Contact us</h2>
              <p>For any questions about this notice or how we handle your data, email us at <a href="mailto:hello.expolead@tradesoil.com" className="text-emerald-600 hover:underline">hello.expolead@tradesoil.com</a>.</p>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}
