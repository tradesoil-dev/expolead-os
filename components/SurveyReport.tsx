import type { ExhibitorReport, SurveyReportData, Level } from "@/lib/survey-report";

// The post-show mini report shown after the survey. Charts are hand-drawn SVG
// (no chart library on this public page), capped in width so labels stay
// readable on desktop; chart cards sit 2 by 2 on wide screens, one column on
// phones.

const LEVEL_BOX: Record<Level, string> = {
  red: "border-rose-200 bg-rose-50",
  amber: "border-amber-200 bg-amber-50",
  green: "border-emerald-100 bg-emerald-50",
};
const LEVEL_BADGE: Record<Level, string> = {
  red: "bg-rose-50 text-rose-700",
  amber: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
};

const card = "rounded-2xl border border-slate-200 bg-white p-5";
const capText = "mb-2.5 text-xs leading-relaxed text-slate-400";

export default function SurveyReport({
  data,
  exhibition,
  preparedFor,
}: {
  data: SurveyReportData;
  exhibition: string;
  preparedFor: string;
}) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="space-y-3">
      <div className={`${card} flex items-start justify-between gap-3 border-t-4 border-t-emerald-600`}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Post-show report</p>
          <p className="mt-0.5 text-xl font-extrabold text-slate-900">{exhibition}</p>
          <p className="mt-1 text-xs text-slate-400">
            {preparedFor ? `Prepared for ${preparedFor} · ` : ""}
            {today}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${LEVEL_BADGE[data.level]}`}>{data.badge}</span>
      </div>

      <div className={`rounded-2xl border p-5 ${LEVEL_BOX[data.level]}`}>
        <h2 className="text-xl font-bold leading-snug text-slate-900">{data.head}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{data.body}</p>
      </div>

      {data.kind === "exhibitor" && <ExhibitorBody r={data} />}

      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-600">
        <p className="mb-1.5 font-semibold text-slate-800">You vs other {exhibition} respondents</p>
        The comparison opens once enough people have answered, so the numbers mean something. We will include it in the combined results.
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-5">
        <p className="text-base font-bold text-slate-900">Every show, one workspace</p>
        <p className="mb-4 mt-1 text-sm leading-relaxed text-slate-600">
          ExpoLead OS keeps every contact, conversation and follow-up from each exhibition in one place you open every morning, and shows what each show brought in.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <a href="https://www.linkedin.com/company/expolead-os/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700">
            Follow ExpoLead OS on LinkedIn
          </a>
          <a href="/features" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-emerald-600 bg-white px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
            See how it works
          </a>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-400">
        This report is a self-check built only from your answers. The cooling curve is an illustration, not measured data.
      </p>
    </div>
  );
}

function ExhibitorBody({ r }: { r: ExhibitorReport }) {
  return (
    <>
      {(r.perContact || r.atRisk) && (
        <div className="grid grid-cols-2 gap-3">
          {r.perContact && <Num k="Each contact cost you" v={r.perContact.value} s={r.perContact.sub} />}
          {r.atRisk && <Num k="Contacts at risk" v={r.atRisk.value} s={r.atRisk.sub} />}
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <Radar r={r} />
        {r.funnel && <Funnel f={r.funnel} />}
        <Cooling speed={r.speed} />
        {r.spend && <Spend s={r.spend} />}
      </div>
      <div className={card}>
        <p className="font-semibold text-slate-900">Your next 7 days</p>
        <div className="mt-3">
          {r.plan.map(([d, t], i) => (
            <div key={d} className={`relative grid grid-cols-[62px_1fr] gap-2.5 pl-4 ${i < r.plan.length - 1 ? "border-l-2 border-emerald-100 pb-3.5" : "border-l-2 border-transparent"}`}>
              <span className="absolute -left-[7px] top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 ring-1 ring-emerald-100" />
              <span className="pt-px text-xs font-bold text-emerald-700">{d}</span>
              <span className="text-sm leading-relaxed text-slate-600">{t}</span>
            </div>
          ))}
        </div>
        {r.nextTip && (
          <div className="mt-3.5 rounded-xl bg-yellow-100 px-3.5 py-3 text-sm leading-relaxed text-yellow-900">
            <span className="mb-0.5 block text-xs font-bold uppercase tracking-wide">For your next show</span>
            {r.nextTip}
          </div>
        )}
      </div>
    </>
  );
}

function Num({ k, v, s }: { k: string; v: string; s: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold text-slate-400">{k}</p>
      <p className="mt-1 text-xl font-extrabold leading-tight text-slate-900">{v}</p>
      <p className="mt-0.5 text-xs leading-snug text-slate-400">{s}</p>
    </div>
  );
}

function Radar({ r }: { r: ExhibitorReport }) {
  const s = r.habits;
  const cx = 150, cy = 128, R = 92, n = s.length;
  const pt = (i: number, rad: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };
  const ring = (lv: number) => s.map((_, i) => pt(i, (R * lv) / 3).join(",")).join(" ");
  const shape = s.map((h, i) => pt(i, (R * h.score) / 3).join(",")).join(" ");
  const dot = { 1: "#e11d48", 2: "#d97706", 3: "#059669" } as const;
  return (
    <div className={card}>
      <p className="font-semibold text-slate-900">Your post-show habits</p>
      <p className={capText}>Scored from your answers. The fuller the shape, the stronger the habit.</p>
      <svg viewBox="-20 0 340 240" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="Habit radar">
        {[1, 2, 3].map((lv) => <polygon key={lv} points={ring(lv)} fill="none" stroke={lv === 3 ? "#cbd5e1" : "#e2e8f0"} />)}
        {s.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" />; })}
        <polygon points={shape} fill="rgba(5,150,105,.18)" stroke="#059669" strokeWidth={2} strokeLinejoin="round" />
        {s.map((h, i) => { const [x, y] = pt(i, (R * h.score) / 3); return <circle key={i} cx={x} cy={y} r={4} fill={dot[h.score]} stroke="#fff" strokeWidth={2} />; })}
        {s.map((h, i) => {
          const [x, y] = pt(i, R + 22);
          const anchor = Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end";
          return <text key={h.name} x={x} y={y + 4} textAnchor={anchor} style={{ font: "600 11px Inter, sans-serif" }} fill="#475569">{h.name}</text>;
        })}
      </svg>
      <p className="mt-1.5 text-sm text-slate-600">
        {r.weak.length ? <>Biggest gaps: <strong>{r.weak.join(", ")}</strong>.</> : "No weak spots in your answers. Strong habits."}
      </p>
    </div>
  );
}

function Funnel({ f }: { f: NonNullable<ExhibitorReport["funnel"]> }) {
  const Row = ({ name, pct, color, text }: { name: string; pct: number; color: string; text: string }) => (
    <div>
      <div className="mb-1.5 flex justify-between gap-2.5 text-[13px] text-slate-600"><span>{name}</span><b className="text-right font-semibold text-slate-900">{text}</b></div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100"><i className="block h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
  return (
    <div className={`${card} flex flex-col`}>
      <p className="font-semibold text-slate-900">Where your contacts stand</p>
      <p className={capText}>From your own estimate of missed follow-ups.</p>
      <div className="flex flex-1 flex-col justify-evenly gap-3">
        <Row name="Contacts made" pct={100} color="#059669" text={f.made} />
        {f.share == null ? (
          <div>
            <div className="mb-1.5 flex justify-between text-[13px] text-slate-600"><span>Followed up properly</span><b className="font-semibold text-slate-900">Unknown</b></div>
            <div className="h-3 rounded-full" style={{ background: "repeating-linear-gradient(45deg,#e2e8f0 0 6px,#f8fafc 6px 12px)" }} />
          </div>
        ) : (
          <>
            <Row name="Likely followed up" pct={Math.round((1 - f.share) * 100)} color="#38bdf8" text={f.followedLabel} />
            <Row name="May never hear from you" pct={Math.max(4, Math.round(f.share * 100))} color="#e11d48" text={f.lostLabel} />
          </>
        )}
      </div>
    </div>
  );
}

function Cooling({ speed }: { speed: ExhibitorReport["speed"] }) {
  const X: Record<string, number> = { "0": 40, "2": 92, "7": 150, "14": 208, "30": 270 };
  const markX = speed ? ({ "2d": 92, "1w": 150, "4w": 238, later: 270 } as Record<string, number>)[speed.key] : null;
  const curve = "M40,34 C70,40 88,52 112,72 S170,118 208,136 S250,152 270,156";
  const small = { font: "500 10px Inter, sans-serif" };
  return (
    <div className={card}>
      <p className="font-semibold text-slate-900">How fast conversations cool</p>
      <p className={capText}>Illustration: the longer a buyer waits, the less they remember you.</p>
      <svg viewBox="0 0 300 200" className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label="Cooling curve">
        <defs>
          <linearGradient id="srWarm" x1="0" x2="1">
            <stop offset="0" stopColor="#059669" stopOpacity=".22" />
            <stop offset="1" stopColor="#e11d48" stopOpacity=".18" />
          </linearGradient>
        </defs>
        <path d={`${curve} L270,170 L40,170 Z`} fill="url(#srWarm)" />
        <path d={curve} fill="none" stroke="#0f172a" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={40} y1={170} x2={282} y2={170} stroke="#e2e8f0" />
        <text x={34} y={38} textAnchor="end" style={small} fill="#94a3b8">Warm</text>
        <text x={34} y={160} textAnchor="end" style={small} fill="#94a3b8">Cold</text>
        {Object.entries(X).map(([d, x]) => <text key={d} x={x} y={186} textAnchor="middle" style={small} fill="#94a3b8">{d === "0" ? "Show" : `${d}d`}</text>)}
        {markX != null && speed && (
          <>
            <line x1={markX} y1={22} x2={markX} y2={170} stroke="#059669" strokeWidth={2} strokeDasharray="4 4" />
            <rect x={Math.min(markX - 52, 196)} y={6} width={104} height={18} rx={9} fill="#059669" />
            <text x={Math.min(markX, 248)} y={19} textAnchor="middle" style={{ font: "700 10px Inter, sans-serif" }} fill="#fff">You: {speed.label}</text>
          </>
        )}
      </svg>
    </div>
  );
}

function Spend({ s }: { s: NonNullable<ExhibitorReport["spend"]> }) {
  const C = 2 * Math.PI * 42;
  return (
    <div className={`${card} flex items-center gap-4 md:flex-col md:items-start`}>
      <svg viewBox="0 0 110 110" className="h-24 w-24 shrink-0" role="img" aria-label="Show spend at risk">
        <circle cx={55} cy={55} r={42} fill="none" stroke="#d1fae5" strokeWidth={14} />
        <circle cx={55} cy={55} r={42} fill="none" stroke="#e11d48" strokeWidth={14} strokeLinecap="round" strokeDasharray={`${(s.share * C).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 55 55)" />
        <text x={55} y={60} textAnchor="middle" style={{ font: "800 18px Inter, sans-serif" }} fill="#0f172a">{s.pct}</text>
      </svg>
      <div>
        <p className="font-semibold text-slate-900">Show spend at risk</p>
        <p className="my-1 text-xl font-extrabold text-slate-900">{s.value}</p>
        <p className="text-xs leading-relaxed text-slate-400">{s.sub}</p>
      </div>
    </div>
  );
}
