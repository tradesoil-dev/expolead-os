"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  sectionsFor, pathFor, fill, emailProblem, hasAnswer, NEXT_SHOW_SUGGESTIONS, TEXT_MAX,
  type Answers, type Question, type Section, type SurveyMode,
} from "@/lib/survey-v2";
import { buildReport } from "@/lib/survey-report";
import SurveyReport from "@/components/SurveyReport";

// The post-show survey (version 2) for both the public link and the pilot
// check-in. One topic per page, every question required, numbered in the
// order this person sees them, then the personal post-show report.

type Contact = { email: string; name: string; company: string; whatsapp: string; linkedin: string; nextShow: string; results: boolean; consent: boolean };

export default function SurveyFlow({
  mode,
  exhibition,
  campaignLabel,
  campaignSlug = "",
  token = "",
  source = "",
  firstName = "",
  preparedFor = "",
}: {
  mode: SurveyMode;
  exhibition: string;
  campaignLabel: string;
  campaignSlug?: string;
  token?: string;
  source?: string;
  firstName?: string;
  preparedFor?: string;
}) {
  const [a, setA] = useState<Answers>({});
  const [c, setC] = useState<Contact>({ email: "", name: "", company: "", whatsapp: "", linkedin: "", nextShow: "", results: false, consent: false });
  const [hp, setHp] = useState("");
  const [step, setStep] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const path = pathFor(mode, a.role_show);
  const all = sectionsFor(mode, path);
  const intro = all.find((s) => s.key === "intro");
  const pages = all.filter((s) => s.key !== "intro");
  const short = exhibition.split(" ")[0] || exhibition;

  // Question numbers across the whole path (the public email counts as Q2).
  const numbers = useMemo(() => {
    const m: Record<string, number> = {};
    let i = 0;
    for (const s of all) {
      for (const q of s.questions) m[q.id] = ++i;
      if (s.key === "intro") m.__email = ++i;
    }
    return m;
  }, [all]);

  const emailErr = c.email.trim() ? emailProblem(c.email) : "";
  const pageDone = (s: Section) => s.questions.every((q) => hasAnswer(q, a[q.id]));
  const contactDone = !!c.name.trim() && !!c.company.trim() && !emailProblem(c.email) && !!c.nextShow.trim();
  const introDone = mode === "pilot" || (!!intro && pageDone(intro) && !emailProblem(c.email));
  const current = step > 0 ? pages[step - 1] : null;
  const isLast = step === pages.length;
  const canNext = step === 0 ? introDone : !!current && pageDone(current) && (!(isLast && mode === "public") || contactDone);

  function set(q: Question, value: string) {
    setA((prev) => {
      const next = { ...prev };
      if (q.kind === "multi") {
        const cur = Array.isArray(prev[q.id]) ? (prev[q.id] as string[]) : [];
        if (cur.includes(value)) next[q.id] = cur.filter((x) => x !== value);
        else if (!q.max || cur.length < q.max) next[q.id] = [...cur, value];
      } else if (q.kind === "scale") next[q.id] = Number(value);
      else next[q.id] = value;
      return next;
    });
  }

  function go(n: number) {
    setStep(n);
    setError("");
    window.scrollTo(0, 0);
  }

  async function submit() {
    if (!canNext || sending) return;
    setSending(true);
    setError("");
    try {
      const res = mode === "pilot"
        ? await fetch("/api/checkin/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, answers: a }) })
        : await fetch("/api/survey/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaign: campaignSlug, source, answers: a, contact: c, website: hp }),
          });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not send your answers. Please try again.");
      setDone(true);
      window.scrollTo(0, 0);
    } catch (e: any) {
      setError(e.message || "Could not send your answers. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const progress = done ? 100 : (step / pages.length) * 100;
  const stepLabel = done ? "Your report" : step === 0 ? "About 3 minutes" : `Step ${step} of ${pages.length}`;
  const who = mode === "pilot" ? preparedFor : [c.name.trim(), c.company.trim()].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3.5">
        <div className={`mx-auto flex items-center justify-between gap-3 ${done ? "max-w-[880px]" : "max-w-2xl"}`}>
          <span className="text-[17px] font-extrabold tracking-wide text-slate-900">EXPOLEAD <span className="text-emerald-600">OS</span></span>
          <span className="text-[13px] font-semibold text-slate-400">{stepLabel}</span>
        </div>
        <div className={`mx-auto mt-2.5 h-1.5 overflow-hidden rounded-full bg-emerald-100 ${done ? "max-w-[880px]" : "max-w-2xl"}`}>
          <div className="h-full rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className={`mx-auto px-4 pb-14 pt-6 ${done ? "max-w-[880px]" : "max-w-2xl"}`}>
        {done ? (
          <SurveyReport data={buildReport(a, exhibition)} exhibition={campaignLabel} preparedFor={who} />
        ) : step === 0 ? (
          <div>
            <span className="inline-block rounded-full border border-yellow-400 bg-yellow-300 px-3 py-1 text-xs font-bold text-yellow-950">{campaignLabel}</span>
            <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-slate-900">
              {exhibition} is over.
              <span className="mt-2 block text-[22px] leading-snug text-emerald-600">How serious are you about turning those contacts into repeatable revenue?</span>
            </h1>
            <div className="my-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <p className="mb-2.5 text-[13px] font-bold text-slate-600">Before you answer, ask yourself:</p>
              {[
                `Do you know which of your ${short} contacts are ready to buy, and which are going cold?`,
                "Could you list every sample, quote and price you promised at the booth?",
                `In three months, will you know what ${exhibition} actually earned you?`,
              ].map((t) => (
                <div key={t} className="mb-2.5 flex gap-2.5 text-sm leading-relaxed text-slate-900 last:mb-0">
                  <b className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-yellow-100 text-xs text-yellow-800">?</b>
                  {t}
                </div>
              ))}
            </div>
            <p className="mb-4 text-[15px] leading-relaxed text-slate-600">
              {mode === "pilot"
                ? `Hi ${firstName || "there"}, we hope ${exhibition} went well for you. This 3 minute check helps us understand how your team handles show contacts, and at the end you get a personal post-show report.`
                : `Take this 3 minute post-show check and get a personal snapshot of where your ${short} contacts stand, plus the combined results from everyone who takes part.`}
            </p>
            {mode === "public" && intro && (
              <>
                {intro.questions.map((q) => <QuestionCard key={q.id} q={q} n={numbers[q.id]} a={a} set={set} exhibition={exhibition} />)}
                <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
                  <h2 className="text-[15px] font-semibold leading-snug text-slate-900">
                    <span className="mr-1 font-bold text-emerald-700">Q{numbers.__email}.</span>Your business email <span className="text-rose-600">*</span>
                  </h2>
                  <p className="mb-3 mt-1 text-[13px] text-slate-400">We email you a copy of your report. Business addresses only</p>
                  <input
                    type="email"
                    value={c.email}
                    onChange={(e) => setC({ ...c, email: e.target.value })}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@yourcompany.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  {emailTouched && emailErr && <p className="mt-2 text-[13px] text-rose-600">{emailErr}</p>}
                </section>
              </>
            )}
            <Nav canNext={canNext} onNext={() => go(1)} nextLabel="Start" />
            <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
              {mode === "pilot"
                ? "We use answers, without names, to improve ExpoLead OS. We never share your name or individual answers. "
                : "Results are only ever shown combined, without names. We never share your email or individual answers. "}
              <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Notice</a>
            </p>
          </div>
        ) : current ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{current.title}</p>
            {current.sub && <p className="mb-4 mt-1 text-sm leading-relaxed text-slate-600">{fill(current.sub, exhibition)}</p>}
            {current.questions.map((q) => <QuestionCard key={q.id} q={q} n={numbers[q.id]} a={a} set={set} exhibition={exhibition} />)}

            {isLast && mode === "public" && (
              <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
                <p className="mb-3 text-[13px] text-slate-500">Fields marked <span className="text-rose-600">*</span> are required.</p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <Field label="Name" req value={c.name} onChange={(v) => setC({ ...c, name: v })} placeholder="Your name" max={120} />
                  <Field label="Company" req value={c.company} onChange={(v) => setC({ ...c, company: v })} placeholder="Company" max={160} />
                </div>
                <div className="mt-2.5">
                  <Field label="Business email" req type="email" value={c.email} onChange={(v) => setC({ ...c, email: v })} placeholder="you@yourcompany.com" max={254} />
                  {c.email.trim() && emailErr && <p className="mt-1.5 text-[13px] text-rose-600">{emailErr}</p>}
                </div>
                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                  <Field label="WhatsApp" type="tel" value={c.whatsapp} onChange={(v) => setC({ ...c, whatsapp: v })} placeholder="+33 6 12 34 56 78" max={40} />
                  <Field label="LinkedIn profile" type="url" value={c.linkedin} onChange={(v) => setC({ ...c, linkedin: v })} placeholder="linkedin.com/in/..." max={200} />
                </div>
                <div className="mt-2.5">
                  <Field label="Your next trade show" req list="survey-shows" value={c.nextShow} onChange={(v) => setC({ ...c, nextShow: v })} placeholder="Start typing, e.g. SIAL Paris 2028" max={120} />
                  <p className="mt-1 text-xs text-slate-400">Pick from the list or type your own.</p>
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <input type="checkbox" checked={c.results} onChange={(e) => setC({ ...c, results: e.target.checked })} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-emerald-600" />
                  Send me the combined results when the survey closes
                </label>
                <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-slate-600">
                  <input type="checkbox" checked={c.consent} onChange={(e) => setC({ ...c, consent: e.target.checked })} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-emerald-600" />
                  Yes, ExpoLead OS can contact me about this
                </label>
                {/* Hidden field: people never see or fill it, bots usually do. */}
                <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" name="website" />
              </section>
            )}
            <datalist id="survey-shows">{NEXT_SHOW_SUGGESTIONS.map((s) => <option key={s} value={s} />)}</datalist>

            {error && <p className="mb-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            <Nav
              canNext={canNext}
              onBack={() => go(step - 1)}
              onNext={isLast ? submit : () => go(step + 1)}
              nextLabel={isLast ? "See my report" : "Next"}
              busy={sending}
            />
            {isLast && mode === "public" && (
              <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
                Your details are only used for what you ticked above and to send your report. You can ask us to delete them at any time at hello@expoleados.com.{" "}
                <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Notice</a>
              </p>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function Nav({ canNext, onNext, onBack, nextLabel, busy = false }: { canNext: boolean; onNext: () => void; onBack?: () => void; nextLabel: string; busy?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-end gap-2.5">
      {onBack && (
        <button type="button" onClick={onBack} className="mr-auto inline-flex min-h-10 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext || busy}
        className="inline-flex min-h-10 min-w-24 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {nextLabel}
      </button>
    </div>
  );
}

function Field({ label, req = false, value, onChange, placeholder, type = "text", list, max }: { label: string; req?: boolean; value: string; onChange: (v: string) => void; placeholder: string; type?: string; list?: string; max: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label} {req ? <span className="text-rose-600">*</span> : <span className="font-normal text-slate-400">(optional)</span>}
      </span>
      <input
        type={type}
        value={value}
        list={list}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}

function QuestionCard({ q, n, a, set, exhibition }: { q: Question; n: number; a: Answers; set: (q: Question, v: string) => void; exhibition: string }) {
  const v = a[q.id];
  const chip = (on: boolean) =>
    `rounded-full border px-3.5 py-2 text-left text-sm font-medium transition-colors ${on ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`;
  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-[18px]">
      <h2 className="text-[15px] font-semibold leading-snug text-slate-900"><span className="mr-1 font-bold text-emerald-700">Q{n}.</span>{fill(q.title, exhibition)}</h2>
      <p className="mb-3 mt-1 text-[13px] text-slate-400">{q.hint}</p>
      {(q.kind === "single" || q.kind === "multi") && (
        <div className="flex flex-wrap gap-2">
          {q.options!.map((o) => {
            const on = q.kind === "multi" ? Array.isArray(v) && v.includes(o.id) : v === o.id;
            return <button key={o.id} type="button" aria-pressed={on} onClick={() => set(q, o.id)} className={chip(on)}>{o.label}</button>;
          })}
        </div>
      )}
      {q.kind === "scale" && (
        <>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((x) => (
              <button key={x} type="button" aria-pressed={v === x} onClick={() => set(q, String(x))} className={`${chip(v === x)} rounded-xl px-0 text-center`}>{x}</button>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-400"><span>{q.scale?.[0]}</span><span>{q.scale?.[1]}</span></div>
        </>
      )}
      {q.kind === "text" && (
        <textarea
          maxLength={TEXT_MAX}
          value={(v as string) ?? ""}
          onChange={(e) => set(q, e.target.value)}
          placeholder={q.placeholder}
          className="min-h-[84px] w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      )}
      {q.kind === "line" && (
        <input
          type="text"
          list="survey-shows"
          maxLength={120}
          value={(v as string) ?? ""}
          onChange={(e) => set(q, e.target.value)}
          placeholder={q.placeholder}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      )}
    </section>
  );
}
