"use client";

import { useEffect, useState } from "react";

const SHOTS = [
  "/screenshots/dashboard.png",
  "/screenshots/opportunities.png",
  "/screenshots/reports.png",
];

const CURSOR = [
  { x: 7, y: 12 },
  { x: 7, y: 19 },
  { x: 7, y: 24 },
];

const LAPTOP = { left: 12.34, top: 6.47, width: 75.2, height: 81.4 };
const PHONE = { left: 5.71, top: 2.39, width: 88.57, height: 95.14 };

const MOBILE_NAV = ["Dashboard", "Exhibitions", "Connections", "Opportunities", "Follow-ups", "Reports"];

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
    <div className="relative mx-auto w-full max-w-[760px]">
      {/* Laptop */}
      <div className="relative w-[80%]">
        <div
          className="absolute overflow-hidden bg-white"
          style={{ left: `${LAPTOP.left}%`, top: `${LAPTOP.top}%`, width: `${LAPTOP.width}%`, height: `${LAPTOP.height}%`, zIndex: 1 }}
        >
          {SHOTS.map((s, idx) => (
            <img
              key={s}
              src={s}
              alt=""
              className="absolute inset-0 h-full w-full transition-opacity duration-500"
              style={{ objectFit: "contain", opacity: idx === i ? 1 : 0 }}
            />
          ))}
          <div
            className="pointer-events-none absolute transition-all duration-700"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, transform: `scale(${click ? 0.75 : 1})` }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#0f172a" stroke="#fff" strokeWidth="1.6"><path d="M4 2l6 16 2.5-6.5L19 9z" /></svg>
          </div>
        </div>
        <img src="/mockups/laptop-t.png" alt="ExpoLead OS on a laptop" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>

      {/* Phone — right side, larger, static */}
      <div className="absolute bottom-[-9%] right-[-1%] z-[3] w-[22%]">
        <div
          className="absolute overflow-hidden bg-slate-50"
          style={{ left: `${PHONE.left}%`, top: `${PHONE.top}%`, width: `${PHONE.width}%`, height: `${PHONE.height}%`, zIndex: 1, borderRadius: "9%" }}
        >
          <div className="flex h-full flex-col p-[8%]">
            <div className="mb-[10%] flex items-center gap-[6%]">
              <div className="h-[10px] w-[10px] rounded-[2px] bg-emerald-500" />
              <span className="text-[9px] font-semibold text-slate-900">ExpoLead</span>
            </div>
            {MOBILE_NAV.map((n, k) => (
              <div key={n} className={`mb-[5%] rounded-[5px] px-[8%] py-[6%] text-[8px] ${k === 0 ? "bg-emerald-700 font-medium text-white" : "text-slate-600"}`}>{n}</div>
            ))}
          </div>
        </div>
        <img src="/mockups/phone-t.png" alt="ExpoLead OS on a phone" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>
    </div>
  );
}
