"use client";

import { useEffect, useState } from "react";

// Full, uncropped screenshots as saved in public/screenshots.
const SHOTS = [
  "/screenshots/dashboard.png",
  "/screenshots/opportunities.png",
  "/screenshots/reports.png",
];

const LAPTOP = { left: 12.34, top: 6.47, width: 75.2, height: 81.4 };
const PHONE = { left: 5.71, top: 2.39, width: 88.57, height: 95.14 };

export default function HeroDevices() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SHOTS.length), 3200);
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
              className="absolute inset-0 h-full w-full transition-opacity duration-700"
              style={{ objectFit: "contain", opacity: idx === i ? 1 : 0 }}
            />
          ))}
        </div>
        <img src="/mockups/laptop-t.png" alt="ExpoLead OS on a laptop" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>

      {/* Phone — bottom right, overlapping the laptop edge (per reference) */}
      <div className="absolute bottom-[-6%] right-[9%] z-[3] w-[13%]">
        <div
          className="absolute overflow-hidden bg-white"
          style={{ left: `${PHONE.left}%`, top: `${PHONE.top}%`, width: `${PHONE.width}%`, height: `${PHONE.height}%`, zIndex: 1, borderRadius: "9%" }}
        >
          <img src="/screenshots/mobile-report.jpeg" alt="ExpoLead OS on a phone" className="h-full w-full" style={{ objectFit: "cover", objectPosition: "top" }} />
        </div>
        <img src="/mockups/phone-t.png" alt="" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>
    </div>
  );
}
