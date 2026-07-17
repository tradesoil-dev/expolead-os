import HeroDevices from "@/components/HeroDevices";

export const metadata = { title: "Hero preview" };

export default function HeroPreviewPage() {
  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(115deg, #0f172a 0%, #065f46 48%, #10b981 100%)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-8 py-20 lg:grid-cols-2">
        <div className="text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Exhibition lead management</p>
          <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">Turn expo conversations into revenue.</h1>
          <p className="mt-5 max-w-md text-lg text-white/85">Capture booth visits, buyer signals, samples, quotations and follow-ups in one workspace built for exhibitors and trade professionals.</p>
        </div>
        <div>
          <HeroDevices />
        </div>
      </div>
    </main>
  );
}
