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

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 text-slate-950">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-6 lg:px-16">
        <div>
  <p className="text-4xl font-black tracking-tight text-slate-950">
    ExpoLead OS
  </p>
  <p className="mt-2 text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
    Powered by Tradesoil
  </p>
</div>

        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm md:flex">
            <Globe2 className="h-4 w-4" />
            EN
          </button>

          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-emerald-800"
          >
            Log in
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/20 hover:bg-emerald-800"
          >
            Book demo
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="grid min-h-[calc(100vh-96px)] items-center gap-12 px-8 pb-16 pt-10 lg:grid-cols-2 lg:px-16">
        {/* LEFT CONTENT */}
        <div className="max-w-3xl">
          

          <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight text-emerald-800 md:text-5xl lg:text-4xl">
  <>
    Turn Expo Conversations
    <br />
    Into Revenue
  </>
</h1>

          <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-800">
            Capture booth visits, buyer signals, samples, quotations and
            follow-ups in one workspace built for exhibitors, sourcing teams and
            international trade professionals.
          </p>

          <div className="mt-8 space-y-5 text-lg text-slate-800">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <span>Track every booth visit and business connection</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <span>Capture buyer intent and qualification signals instantly</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <span>Manage samples, quotations and follow-ups in one place</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <span>Never lose opportunities after an exhibition ends</span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-700" />
              <span>Built for international trade, sourcing and B2B sales teams</span>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-800/20 hover:bg-emerald-800"
            >
              Book demo
              <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white/80 px-8 py-4 text-base font-bold text-emerald-800 shadow-sm hover:bg-white"
            >
              View login
            </Link>
          </div>
        </div>

        {/* RIGHT PRODUCT MOCKUP */}
        <div className="relative hidden lg:block">
          <div className="absolute -left-10 top-10 h-32 w-44 rounded-2xl bg-white p-4 shadow-xl">
            <p className="text-xs font-semibold text-slate-500">
              Lead Quality
            </p>
            <div className="mt-4 flex items-end gap-3">
              <div className="h-16 w-8 rounded-t-lg bg-emerald-300" />
              <div className="h-24 w-8 rounded-t-lg bg-emerald-500" />
              <div className="h-20 w-8 rounded-t-lg bg-slate-700" />
              <div className="h-28 w-8 rounded-t-lg bg-emerald-700" />
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

      {/* GROWTH SECTION */}
<section className="grid min-h-[300px] bg-white lg:grid-cols-2">
  <div className="min-h-[240px] bg-[url('/growth-meeting.jpg')] bg-cover bg-left" />

  <div className="flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-8 py-20 text-center">
    <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-emerald-800 md:text-5xl lg:text-5xl">
  Driving revenue growth
</h2>
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
        <p>Tradesoil</p>
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