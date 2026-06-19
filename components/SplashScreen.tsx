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
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 cursor-pointer select-none"
      style={{
        transition: "opacity 0.4s ease",
        opacity: hiding ? 0 : 1,
      }}
    >
      {/* Animated floor plan icon */}
      <div className="flex flex-col gap-2.5 mb-8">
        <div className="flex gap-2.5">
          <div className="anim-sq1 w-10 h-10 rounded-[7px] border-[2.5px] border-white" />
          <div className="anim-sq2 w-10 h-10 rounded-[7px] border-[2.5px] border-white" />
        </div>
        <div className="flex gap-2.5">
          <div className="anim-sq3 w-10 h-10 rounded-[7px] border-[2.5px] border-white" />
          <div className="anim-sq4 w-10 h-10 rounded-[7px] bg-emerald-500" />
        </div>
      </div>

      {/* Logo text */}
      <div className="anim-logo-text flex items-center text-[30px] font-semibold tracking-tight leading-none">
        <span className="text-white">Expo</span>
        <span className="text-emerald-400">Lead</span>
        <span className="text-slate-500 text-[20px] font-normal ml-1.5">OS</span>
      </div>

      {/* Tagline */}
      <p className="anim-tagline mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
        Powered by Tradesoil
      </p>

      {/* Tap hint */}
      <p className="anim-tap-hint absolute bottom-14 text-[12px] text-slate-500">
        tap anywhere to continue
      </p>
    </div>
  );
}
