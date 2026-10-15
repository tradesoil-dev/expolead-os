"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, MessageSquare, Bell, Target, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

// Decorative left panel of the login page. Purely presentational: it never
// touches auth, and if anything here failed the sign-in form beside it would
// be unaffected. Styles live in globals.css under the "ls-" prefix.

type Mode = "signin" | "signup";

// The exhibition cycle. Every stage is a real screen in ExpoLead and every
// connection passes through all five. Icons 3 to 5 match the app menu
// (Follow-ups, Opportunities, Reports).
const STAGES = [
  { title: "Booth Visit", Icon: Users, signin: "Add today's connections", signup: "Scan a card, contact saved in seconds" },
  { title: "Discussion", Icon: MessageSquare, signin: "Notes and products discussed", signup: "Record notes and products discussed" },
  { title: "Follow-up", Icon: Bell, signin: "See who needs a reply today", signup: "Never let a lead go cold" },
  { title: "Opportunity", Icon: Target, signin: "Move samples and quotes forward", signup: "Track samples, quotes and deal value" },
  { title: "Show ROI", Icon: BarChart3, signin: "Check what each show brought back", signup: "Prove every exhibition was worth it" },
] as const;

const COPY = {
  signin: {
    badge: "Private workspace",
    head: ["The show ends.", "Your connections keep moving."],
    sub: "One private workspace for everything from the exhibitions you attend.",
    eyebrow: "Your exhibition cycle",
  },
  signup: {
    badge: "14-day free trial · No credit card needed",
    head: ["Turn every booth conversation", "into business."],
    sub: "Capture, follow up and see what each show brings back.",
    eyebrow: "How ExpoLead OS works",
  },
} as const;

// Ring geometry (in a 260 x 260 box).
const SIZE = 260;
const C = 130;
const R = 100;
const CIRC = 2 * Math.PI * R;
const N = STAGES.length;
const TRAVEL = 900; // ms for the line to travel between stages
const STEP_EVERY = 2600; // ms between steps
const pos = (i: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
};

export default function LoginShowcase({ mode }: { mode: Mode }) {
  const copy = COPY[mode];

  // step = the stage currently lit. departed = its tick is shown and the line
  // is travelling onward. line = how many segments are drawn (0..N).
  const [step, setStep] = useState(0);
  const [departed, setDeparted] = useState(false);
  const [line, setLine] = useState(0);
  const [cycle, setCycle] = useState(0); // new key per loop: a fresh line that starts empty
  const [burst, setBurst] = useState(0);
  const busy = useRef(false);
  const stepRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 1024px)"); // panel is hidden below lg
    const later = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // Strict order every step: tick the current stage, let the line travel to
    // the next one, and only light the next stage once the line has arrived.
    const advance = () => {
      if (busy.current || reduce.matches || !wide.matches || document.hidden) return;
      busy.current = true;
      const s = stepRef.current;
      const last = s === N - 1;
      setDeparted(true);
      setLine(last ? N : s + 1);
      later(() => {
        if (!last) {
          setStep(s + 1);
          setDeparted(false);
          busy.current = false;
          return;
        }
        // Cycle complete: ripple, then begin again at Booth Visit.
        setBurst((b) => b + 1);
        later(() => {
          setCycle((c) => c + 1);
          setLine(0);
          setStep(0);
          setDeparted(false);
          busy.current = false;
        }, 1200);
      }, TRAVEL);
    };

    const interval = window.setInterval(advance, STEP_EVERY);
    return () => {
      window.clearInterval(interval);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      busy.current = false;
    };
  }, []);

  const nodeState = (i: number) =>
    i < step || (i === step && departed) ? "done" : i === step ? "active" : "idle";
  const current = STAGES[step];
  const CurrentIcon = current.Icon;

  return (
    <section className="ls-panel hidden lg:flex">
      <div className="ls-glow ls-g1" aria-hidden="true" />
      <div className="ls-glow ls-g2" aria-hidden="true" />

      <div className="ls-content">
        <Link href="/" className="inline-block" aria-label="Go to ExpoLead OS home">
          <span className="text-[22px] font-bold uppercase tracking-tight leading-none">
            <span className="text-white">EXPOLEAD</span>
            <span className="text-emerald-300">&nbsp;OS</span>
          </span>
        </Link>

        <div className="ls-main">
          <div key={mode} className="ls-fade">
            <div className="ls-badge">
              {mode === "signin" ? <ShieldCheck size={14} /> : <Sparkles size={14} />}
              {copy.badge}
            </div>
            <h2 className="ls-head">
              {copy.head[0]}
              <br />
              {copy.head[1]}
            </h2>
            <p className="ls-sub">{copy.sub}</p>
          </div>

          <div className="ls-card" aria-hidden="true">
            <div className="ls-ring">
              <svg className="ls-track" viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <defs>
                  {/* Gaps under each stage so the line never shows through a circle.
                      Applied on unrotated groups so the gaps stay aligned. */}
                  <mask id="ls-gaps" maskUnits="userSpaceOnUse" x="0" y="0" width={SIZE} height={SIZE}>
                    <rect width={SIZE} height={SIZE} fill="#fff" />
                    {STAGES.map((_, i) => {
                      const p = pos(i);
                      return <circle key={i} cx={p.x} cy={p.y} r={29} fill="#000" />;
                    })}
                  </mask>
                </defs>
                <g mask="url(#ls-gaps)">
                  <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth={3} />
                </g>
                <g mask="url(#ls-gaps)">
                  <circle
                    key={cycle}
                    cx={C}
                    cy={C}
                    r={R}
                    fill="none"
                    stroke="#fff"
                    strokeWidth={3}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${C} ${C})`}
                    strokeDasharray={CIRC}
                    strokeDashoffset={CIRC * (1 - line / N)}
                    style={{ transition: `stroke-dashoffset ${TRAVEL}ms ease` }}
                  />
                </g>
              </svg>

              {STAGES.map((s, i) => {
                const p = pos(i);
                const state = nodeState(i);
                const Icon = s.Icon;
                return (
                  <div key={s.title} className={`ls-node ls-${state}`} style={{ left: p.x, top: p.y }}>
                    {state === "done" ? <span className="ls-tick">✓</span> : <Icon size={20} />}
                  </div>
                );
              })}

              <div className="ls-center">
                <div key={burst} className={burst ? "ls-burst" : ""} />
                <div key={`i${step}`} className="ls-big">
                  <CurrentIcon size={54} strokeWidth={1.6} />
                </div>
              </div>
            </div>

            <div className="ls-info">
              <div className="ls-eyebrow">{copy.eyebrow}</div>
              <div key={`t${step}${mode}`} className="ls-text">
                <div className="ls-step">
                  Step {step + 1} of {N}
                </div>
                <h3 className="ls-title">{current.title}</h3>
                <p className="ls-desc">{current[mode]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
