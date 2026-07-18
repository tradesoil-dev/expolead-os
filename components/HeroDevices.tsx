"use client";

import { useEffect, useState } from "react";

// Screenshots pre-cropped to the laptop screen's aspect, so they fill the
// screen exactly (no bars, no stretch) and cursor coords map 1:1 to the image.
const SLIDES = [
  { src: "/screenshots/dashboard-c.png", cursor: { x: 8.6, y: 8.7 } },
  { src: "/screenshots/opportunities-c.png", cursor: { x: 8.6, y: 16.9 } },
  { src: "/screenshots/reports-c.png", cursor: { x: 8.6, y: 22.2 } },
];

const LAPTOP = { left: 12.34, top: 6.47, width: 75.2, height: 81.4 };
const PHONE = { left: 5.71, top: 2.39, width: 88.57, height: 95.14 };

export default function HeroDevices() {
  const [i, setI] = useState(0);
  const [cursor, setCursor] = useState(SLIDES[0].cursor);
  const [click, setClick] = useState(false);

  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur = (cur + 1) % SLIDES.length;
      setCursor(SLIDES[cur].cursor);
      setTimeout(() => {
        setClick(true);
        setTimeout(() => {
          setClick(false);
          setI(cur);
        }, 180);
      }, 750);
    }, 3000);
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
          {SLIDES.map((s, idx) => (
            <img
              key={s.src}
              src={s.src}
              alt=""
              className="absolute inset-0 h-full w-full transition-opacity duration-500"
              style={{ objectFit: "cover", opacity: idx === i ? 1 : 0 }}
            />
          ))}
          <div
            className="pointer-events-none absolute transition-all duration-700 ease-out"
            style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, transform: `scale(${click ? 0.7 : 1})`, zIndex: 3 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8"><path d="M4 2l6 16 2.5-6.5L19 9z" /></svg>
          </div>
        </div>
        <img src="/mockups/laptop-t.png" alt="ExpoLead OS on a laptop" className="relative block w-full" style={{ zIndex: 2 }} />
      </div>

      {/* Phone — right side, static */}
      <div className="absolute bottom-[-9%] right-[-1%] z-[3] w-[22%]">
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
