import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Users,
  FileText,
  FlaskConical,
} from "lucide-react";
import SplashScreen from "@/components/SplashScreen";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 text-slate-950">
      <SplashScreen />
      {/* HEADER */}
      <header className="flex items-center justify-between bg-slate-800 px-4 py-3 lg:px-16 lg:py-4">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex flex-col gap-[3.5px] shrink-0">
            <div className="flex gap-[3.5px]">
              <div className="anim-sq1 w-[11px] h-[11px] rounded-[2.5px] border-[1.8px] border-white" />
              <div className="anim-sq2 w-[11px] h-[11px] rounded-[2.5px] border-[1.8px] border-white" />
            </div>
            <div className="flex gap-[3.5px]">
              <div className="anim-sq3 w-[11px] h-[11px] rounded-[2.5px] border-[1.8px] border-white" />
              <div className="anim-sq4 w-[11px] h-[11px] rounded-[2.5px] bg-emerald-500" />
            </div>
          </div>
          <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:hidden shrink-0">
            <rect x="1" y="1" width="17" height="17" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <rect x="22" y="1" width="17" height="17" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <rect x="1" y="22" width="17" height="17" rx="3" stroke="white" strokeWidth="2" fill="none"/>
            <rect x="22" y="22" width="17" height="17" rx="3" fill="#10b981"/>
          </svg>
          <span className="flex items-center text-[16px] font-semibold tracking-tight leading-none">
            <span className="text-white">Expo</span><span className="text-emerald-400">Lead</span><span className="hidden sm:inline text-slate-400 text-[11px] font-normal ml-1">OS</span>
          </span>
        </div>

        <div className="anim-nav-links flex items-center gap-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>

          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Log in
          </Link>

          <Link
            href="/login?mode=signup"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="grid min-h-[calc(100vh-96px)] items-center gap-12 px-8 pb-16 pt-10 lg:grid-cols-2 lg:px-16">
        {/* LEFT CONTENT */}
        <div className="max-w-3xl">
          <p className="anim-hero-badge mb-4 text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Exhibition Lead Management</p>

          <h1 className="anim-hero-title max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-slate-900 md:text-5xl lg:text-4xl">
            Turn Expo Conversations
            <br />
            Into Revenue
          </h1>

          <p className="anim-hero-sub mt-8 max-w-2xl text-xl leading-9 text-slate-700">
            Capture booth visits, buyer signals, samples, quotations and
            follow-ups in one workspace built for exhibitors, sourcing teams and
            international trade professionals.
          </p>

          <div className="anim-hero-sub mt-8 space-y-5 text-lg text-slate-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>Track every booth visit and business connection</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>Capture buyer intent and qualification signals instantly</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>Manage samples, quotations and follow-ups in one place</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>Never lose opportunities after an exhibition ends</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>Built for international trade, sourcing and B2B sales teams</span>
            </div>
          </div>

          <div className="anim-hero-btn mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login?mode=signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT PRODUCT MOCKUP */}
        <div className="relative hidden lg:block">
          <style>{`
            @keyframes growUp {
              0%   { transform: scaleY(0); opacity: 0; }
              60%  { transform: scaleY(1); opacity: 1; }
              80%  { transform: scaleY(1); opacity: 1; }
              95%  { transform: scaleY(0); opacity: 0; }
              100% { transform: scaleY(0); opacity: 0; }
            }
            .bar {
              transform-origin: bottom;
              animation: growUp 2.4s cubic-bezier(0.34,1.56,0.64,1) infinite;
            }
          `}</style>
          <div className="absolute -left-10 top-10 h-32 w-44 rounded-2xl bg-white p-4 shadow-xl">
            <p className="text-xs font-semibold text-slate-500">
              Lead Quality
            </p>
            <div className="mt-4 flex items-end gap-3">
              <div className="bar h-16 w-8 rounded-t-lg bg-emerald-300" style={{ animationDelay: "0.1s" }} />
              <div className="bar h-24 w-8 rounded-t-lg bg-emerald-500" style={{ animationDelay: "0.25s" }} />
              <div className="bar h-20 w-8 rounded-t-lg bg-slate-700" style={{ animationDelay: "0.4s" }} />
              <div className="bar h-28 w-8 rounded-t-lg bg-emerald-700" style={{ animationDelay: "0.55s" }} />
            </div>
          </div>

          <div className="rounded-[2rem] border-[10px] border-slate-950 bg-white shadow-2xl shadow-emerald-900/20">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-900">ExpoLead Pipeline</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live show
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 p-5">
              {[
                {
                  title: "Prospects",
                  value: "24",
                  items: ["KENP Korea", "Hanwha Bio", "SK Eco"],
                  icon: Users,
                },
                {
                  title: "Qualified",
                  value: "12",
                  items: ["UCO China", "Palm Supplier", "Coating Buyer"],
                  icon: ShieldCheck,
                },
                {
                  title: "Samples",
                  value: "7",
                  items: ["Residue FAME", "UCO Spec", "R-POME"],
                  icon: FlaskConical,
                },
                {
                  title: "Quotation",
                  value: "4",
                  items: ["500 MT UCO", "FAME Korea", "China Feedstock"],
                  icon: FileText,
                },
              ].map((column) => {
                const Icon = column.icon;

                return (
                  <div
                    key={column.title}
                    className="min-h-[360px] rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {column.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {column.value} leads
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {column.items.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Follow-up required
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-8 right-8 rounded-2xl bg-white p-5 shadow-xl">
            <p className="text-sm font-bold text-slate-800">
              Next best action
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Send quotation reminder to qualified buyer
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            From booth to closed deal, in three steps
          </h2>
        </div>

        <style>{`
          @keyframes drawLine {
            0%   { transform: scaleX(0); }
            60%  { transform: scaleX(1); }
            80%  { transform: scaleX(1); }
            95%  { transform: scaleX(0); }
            100% { transform: scaleX(0); }
          }
          .progress-line {
            transform-origin: left;
            animation: drawLine 3s ease-in-out infinite;
          }
        `}</style>

        <div className="relative mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-3">
          {/* connecting track — sits behind circles, between col 1 center and col 3 center */}
          <div className="absolute hidden md:block" style={{ top: 27, left: "calc(16.67% + 28px)", right: "calc(16.67% + 28px)", height: 2, background: "#d1fae5" }}>
            <div className="progress-line absolute inset-0" style={{ background: "#059669" }} />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg">1</div>
            <h3 className="mt-6 text-lg font-bold text-slate-900">Capture at the booth</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Log connections, buyer signals, booth location and first impressions on the spot — no paper, no chaos.</p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg">2</div>
            <h3 className="mt-6 text-lg font-bold text-slate-900">Qualify and pipeline</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Score each contact by interest, priority and sample status. Move them through your pipeline while the exhibition is still live.</p>
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-lg">3</div>
            <h3 className="mt-6 text-lg font-bold text-slate-900">Follow up and close</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Scheduled reminders, quotation tracking and opportunity stages keep every deal moving after you leave the show floor.</p>
          </div>
        </div>

      </section>

      {/* WHO IT'S FOR */}
      <section className="bg-slate-50 px-8 py-20 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Who it's for</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Built for the people who work exhibitions
          </h2>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-slate-900">Exhibitors</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Teams exhibiting at trade shows who need to capture and qualify leads on the show floor.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-slate-900">Sourcing teams</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Buyers and procurement professionals visiting exhibitions to find new connections and products.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <Globe2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-slate-900">International traders</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">B2B sales and trade professionals managing cross-border connections and buyer relationships.</p>
          </div>
        </div>
      </section>

      {/* GROWTH SECTION */}
<section className="grid min-h-[300px] bg-white lg:grid-cols-2">
  <div className="min-h-[240px] bg-cover bg-left" style={{ backgroundImage: "url('/growth-meeting.jpg.jpg')" }} />

  <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-8 py-20 text-center">
    <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-emerald-800 md:text-5xl lg:text-5xl">
  Driving revenue growth
</h2>
  </div>
</section>
{/* FOUNDER NOTE */}
<section className="bg-slate-900 px-8 py-16 lg:px-16">
  <div className="max-w-2xl mx-auto">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-500 mb-6">A note from the founder</p>
    <div className="text-5xl leading-none text-emerald-500 font-serif mb-4">&ldquo;</div>
    <p className="text-[17px] leading-[1.85] text-slate-300 italic mb-6">
      ExpoLead OS was built by someone who has worked in international trade, understands the exhibition floor, and believes that serious professionals deserve serious tools.
      <br /><br />
      This is not a generic CRM adapted for exhibitions. It was designed specifically for the way trade professionals work — on the floor, across borders, under time pressure.
      <br /><br />
      Built with conviction. Designed for results.
    </p>
    <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
      <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-sm font-semibold text-emerald-500 shrink-0">
        GG
      </div>
      <div>
        <p className="text-sm font-semibold text-white">Gladwin Gerald</p>
        <p className="text-xs text-slate-500 mt-0.5">Founder, ExpoLead OS · Tradesoil International</p>
      </div>
    </div>
  </div>
</section>

{/* FOOTER LINKS */}
<section className="border-t border-emerald-900/10 bg-white px-8 py-12 lg:px-12">
  <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
    <div>
      <h3 className="mb-4 text-sm font-bold text-slate-950">
        ExpoLead OS
      </h3>

      <div className="space-y-3 text-sm text-slate-600">
        <p>About</p>
        <p>Product Overview</p>
        <p>Exhibitions</p>
        <p>Trade Show Teams</p>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-bold text-slate-950">
        Use Cases
      </h3>

      <div className="space-y-3 text-sm text-slate-600">
        <p>Lead Capture</p>
        <p>Buyer Qualification</p>
        <p>Sample Tracking</p>
        <p>Quotation Follow-ups</p>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-bold text-slate-950">
        Resources
      </h3>

      <div className="space-y-3 text-sm text-slate-600">
        <p>Help Center</p>
        <p>Product Guide</p>
        <p>Best Practices</p>
        <p>Support</p>
      </div>
    </div>

    <div>
      <h3 className="mb-4 text-sm font-bold text-slate-950">
        Company
      </h3>

      <div className="space-y-3 text-sm text-slate-600">
        <a href="https://www.tradesoil.com" target="_blank" rel="noreferrer" className="hover:underline">Tradesoil</a>
        <p>Contact</p>
        <p>Privacy Notice</p>
        <p>Terms of Service</p>
      </div>
    </div>
  </div>
</section>
{/* FOOTER */}
<footer className="border-t border-emerald-900/10 bg-white px-8 py-10 lg:px-16">
  <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Globe2 className="h-5 w-5" />
        English (US)
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
        <span>© 2026 ExpoLead OS</span>
        <span>|</span>
        <a href="#" className="hover:text-emerald-700">Terms of Service</a>
        <span>|</span>
        <a href="#" className="hover:text-emerald-700">Privacy Notice</a>
        <span>|</span>
        <a href="#" className="hover:text-emerald-700">Site map</a>
        <span>|</span>
        <a href="#" className="hover:text-emerald-700">Cookie Notice</a>
      </div>
    </div>

    <div className="flex flex-col gap-5 lg:items-end">
      <div className="flex items-center gap-4 text-slate-500">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
          f
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
          IG
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
          X
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
          in
        </span>
      </div>

      <p className="text-sm text-slate-700">
        Built for exhibitions. Designed for revenue growth.
      </p>
    </div>
  </div>
  
</footer>
    </main>
  );
}