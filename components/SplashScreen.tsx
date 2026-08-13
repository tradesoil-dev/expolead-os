"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    setVisible(true);
  }, []);

  function dismiss() {
    setHiding(true);
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[100] flex cursor-pointer select-none flex-col items-center justify-center bg-[#f8f7f3]"
      style={{ transition: "opacity 0.4s ease", opacity: hiding ? 0 : 1 }}
    >
      <style>{`
        @keyframes splashLogoPlay { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.05); opacity: 1; } }
        .splash-logo-play { animation: splashLogoPlay 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .splash-logo-play { animation: none; opacity: 1; } }
      `}</style>

      {/* Logo text — playing */}
      <div className="splash-logo-play flex items-center text-[34px] font-bold uppercase leading-none tracking-tight">
        <span className="text-slate-900">EXPOLEAD</span>
        <span className="text-emerald-600">&nbsp;OS</span>
      </div>

      {/* Tagline */}
      <p className="anim-tagline mt-4 max-w-[260px] text-center text-[13px] leading-relaxed text-slate-500">
        Built for exhibitions. Designed for revenue growth.
      </p>

      {/* Tap hint */}
      <p className="anim-tap-hint absolute bottom-14 text-[12px] text-slate-400">
        tap anywhere to continue
      </p>
    </div>
  );
}
