"use client";

import { useEffect, useRef, useState } from "react";

// Homepage Security & trust card: a padlock inside a shield that clicks shut
// once when the card scrolls into view, then stays locked with a soft shine
// every few seconds. It is never shown unlocked at rest (the open state only
// lasts the moment before it locks). Reduced motion: locked and still.
// Animation styles live in globals.css (.seclock-*).
export default function SecurityLock({ badge }: { badge: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`seclock relative flex h-[240px] w-[220px] items-center justify-center overflow-hidden rounded-2xl ${play ? "seclock-play" : ""}`}
      style={{ background: "linear-gradient(145deg, #064e3b, #065f46, #047857)" }}
    >
      <div className="absolute h-40 w-40 rounded-full" style={{ background: "rgba(16,185,129,0.18)" }} />
      <div className="absolute h-56 w-56 rounded-full" style={{ background: "rgba(16,185,129,0.07)" }} />
      <div className="seclock-ring absolute h-[120px] w-[120px] rounded-full border-2" style={{ borderColor: "rgba(110,231,183,0.7)" }} />
      <div className="absolute right-5 top-4 h-1.5 w-1.5 rounded-full bg-emerald-300 opacity-80" />
      <div className="absolute bottom-6 left-5 h-1 w-1 rounded-full bg-emerald-200 opacity-60" />
      <div className="absolute left-5 top-12 h-1 w-1 rounded-full bg-emerald-400 opacity-50" />
      <svg width="140" height="158" viewBox="0 0 140 158" fill="none" role="img" aria-label="A padlock locked inside a shield" className="relative">
        <defs>
          <clipPath id="seclock-body-clip"><rect x="46" y="80" width="48" height="38" rx="8" /></clipPath>
          <linearGradient id="seclock-shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M70 8 L124 30 L124 78 C124 114 100 138 70 152 C40 138 16 114 16 78 L16 30 Z" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.6)" strokeWidth="2" />
        <path d="M70 22 L110 38 L110 78 C110 106 92 126 70 138 C48 126 30 106 30 78 L30 38 Z" fill="rgba(16,185,129,0.10)" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5" />
        <g className="seclock-shackle">
          <path d="M56 82 L56 64 C56 54 84 54 84 64 L84 82" fill="none" stroke="#34d399" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M60 82 L60 66 C60 59 80 59 80 66 L80 82" fill="none" stroke="rgba(167,243,208,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g className="seclock-body">
          <rect x="46" y="80" width="48" height="38" rx="8" fill="#0f6b52" stroke="#34d399" strokeWidth="2" />
          <line x1="46" y1="93" x2="94" y2="93" stroke="rgba(52,211,153,0.2)" strokeWidth="1" />
          <g className="seclock-key">
            <circle cx="70" cy="97" r="5" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
            <rect x="68" y="100" width="4" height="7" rx="1" fill="#34d399" />
          </g>
          <g clipPath="url(#seclock-body-clip)">
            <rect className="seclock-shinebar" x="52" y="76" width="16" height="46" fill="url(#seclock-shine)" transform="skewX(-18)" />
          </g>
        </g>
      </svg>
      <div className="seclock-badge absolute bottom-3 left-1/2 whitespace-nowrap rounded-full border px-3 py-1" style={{ background: "rgba(6,78,59,0.85)", borderColor: "rgba(52,211,153,0.4)" }}>
        <p className="text-[10px] font-bold tracking-wide text-emerald-300">{badge}</p>
      </div>
    </div>
  );
}
