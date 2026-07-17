"use client";

import { useEffect, useState } from "react";

const SHOTS = [
  "/screenshots/dashboard.png",
  "/screenshots/opportunities.png",
  "/screenshots/reports.png",
];

// Cursor target over the sidebar area, as % of the laptop screen content.
const CURSOR = [
  { x: 7, y: 20 },
  { x: 7, y: 40 },
  { x: 7, y: 62 },
];

const LAPTOP = { left: 19.75, top: 17.75, width: 64.6, height: 56.93 };
const PHONE = { left: 37.6, top: 11.88, width: 24.8, height: 76.17 };

export default function HeroDevices() {
  const [i, setI] = useState(0);
  const [cursor, setCursor] = useState(CURSOR[0]);
  const [click, setClick] = useState(false);

  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur = (cur + 1) % SHOTS.length;
      setCursor(CURSOR[cur]);
      setTimeout(() => {
        setClick(true);
        setTimeout(() => {
          setClick(false);
          setI(cur);
        }, 170);
      }, 720);
    }, 2900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[680px]">
      {/* Laptop */}
      <div className="relative">
        <div
          className="absolute overflow-hidden"
          style={{ left: `${LAPTOP.left}%`, top: `${LAPTOP.top}%`, width: `${LAPTOP.width}%`, height: `${LAPTOP.height}%`, zIndex: 1 }}
        >
          {SHOTS.map((s, idx) => (
            <img
              key={s}
              src={s}
              alt=""
              className="absolute inset-0 h-full w-full transition-opacity duration-500"
              style={{ objectFit: "cover", objectPosition: "top left", opacity: idx === i ? 1 : 0 }}
            />
          ))}
          <div
            className="pointer-events-none absolute transition-all duration-700"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, transform: `scale(${click ? 0.8 : 1})` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#0f172a" stroke="#fff" strokeWidth="1.5"><path d="M4 2l6 16 2.5-6.5L19 9z" /></svg>
          </div>
        </div>
        <img src="/mockups/laptop.png" alt="ExpoLead OS on a laptop" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>

      {/* Phone */}
      <div className="absolute bottom-[-4%] left-[-2%] w-[26%]">
        <div
          className="absolute overflow-hidden bg-white"
          style={{ left: `${PHONE.left}%`, top: `${PHONE.top}%`, width: `${PHONE.width}%`, height: `${PHONE.height}%`, zIndex: 1 }}
        >
          <div className="flex h-full flex-col p-[6%]">
            <div className="mb-[8%] flex items-center gap-[4%]">
              <div className="h-[7px] w-[7px] rounded-[2px] bg-emerald-500 sm:h-[9px] sm:w-[9px]" />
              <span className="text-[7px] font-semibold text-slate-900 sm:text-[9px]">ExpoLead</span>
            </div>
            {["Dashboard", "Exhibitions", "Connections", "Opportunities", "Follow-ups", "Reports"].map((n, k) => (
              <div key={n} className={`mb-[3%] rounded-[3px] px-[6%] py-[4%] text-[6px] sm:text-[8px] ${k === 0 ? "bg-emerald-700 font-medium text-white" : "text-slate-600"}`}>{n}</div>
            ))}
          </div>
        </div>
        <img src="/mockups/phone.png" alt="ExpoLead OS on a phone" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>
    </div>
  );
}
