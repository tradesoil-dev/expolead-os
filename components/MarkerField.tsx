"use client";

import { useEffect, useRef } from "react";

// Cursor-reactive hero background: a full-bleed canvas grid of short sticks
// resting at -35 degrees that turn to point at the cursor, with an emerald
// radial glow around it. When the cursor is idle the sticks "breathe" gently;
// with reduced motion it draws once, static. Place it as the first child of a
// `relative overflow-hidden` section; it fills the section and sits behind the
// content. The cursor is tracked on the window, so text on top (which can use
// pointer-events: none) never blocks it.
//
// Design reference: ExpoLead hero background study (artifact), density 52 and
// glow reach 260, "Point to cursor" mode.

const DENSITY = 52; // 0..100, higher = denser
const REACH = 260; // px, radius of the glow and of the strongest turn
const STICK = 15; // px, resting stick length
const BASE = (-35 * Math.PI) / 180; // resting diagonal
const IDLE_MS = 1400;

const THEMES = {
  dark: {
    rest: [226, 232, 240] as const, // slate-200
    hot: [255, 255, 255] as const,
    restAlpha: 0.18,
    hotAlpha: 0.9,
    glow: "52,211,153", // emerald-400
    glowAlpha: 0.22,
    staticAlpha: 0.2,
  },
  light: {
    rest: [100, 116, 139] as const, // slate-500
    hot: [5, 150, 105] as const, // emerald-600
    restAlpha: 0.22,
    hotAlpha: 0.95,
    glow: "16,185,129", // emerald-500
    glowAlpha: 0.14,
    staticAlpha: 0.22,
  },
};

type Stick = { x: number; y: number; a: number; seed: number };

function angleLerp(a: number, b: number, t: number) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export default function MarkerField({ variant = "dark", className = "" }: { variant?: "dark" | "light"; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const host = canvas?.parentElement;
    if (!canvas || !ctx || !host) return;

    const theme = THEMES[variant];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const gap = Math.round(72 - (DENSITY / 100) * 42); // 72..30 px
    let W = 0;
    let H = 0;
    let sticks: Stick[] = [];
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };
    let lastMove = -9999;
    let raf = 0;
    let visible = true;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const cols = Math.ceil(W / gap) + 1;
      const rows = Math.ceil(H / gap) + 1;
      const offX = (W - (cols - 1) * gap) / 2;
      const offY = (H - (rows - 1) * gap) / 2;
      sticks = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) sticks.push({ x: offX + c * gap, y: offY + r * gap, a: BASE, seed: Math.random() * Math.PI * 2 });
      }
    };

    const rgba = (from: readonly number[], to: readonly number[], k: number, alpha: number) =>
      `rgba(${Math.round(from[0] + (to[0] - from[0]) * k)},${Math.round(from[1] + (to[1] - from[1]) * k)},${Math.round(from[2] + (to[2] - from[2]) * k)},${alpha})`;

    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = "round";
      ctx.lineWidth = 2;
      ctx.strokeStyle = rgba(theme.rest, theme.rest, 0, theme.staticAlpha);
      const hx = (Math.cos(BASE) * STICK) / 2;
      const hy = (Math.sin(BASE) * STICK) / 2;
      ctx.beginPath();
      for (const s of sticks) {
        ctx.moveTo(s.x - hx, s.y - hy);
        ctx.lineTo(s.x + hx, s.y + hy);
      }
      ctx.stroke();
    };

    const frame = (now: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.16;
      pointer.y += (pointer.ty - pointer.y) * 0.16;
      const idle = now - lastMove > IDLE_MS;
      const t = now * 0.001;

      ctx.clearRect(0, 0, W, H);
      if (pointer.active) {
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, REACH);
        g.addColorStop(0, `rgba(${theme.glow},${theme.glowAlpha})`);
        g.addColorStop(1, `rgba(${theme.glow},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      ctx.lineCap = "round";
      ctx.lineWidth = 2;
      for (const s of sticks) {
        const dx = pointer.x - s.x;
        const dy = pointer.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = pointer.active ? Math.max(0, 1 - dist / REACH) : 0;
        const target =
          idle || !pointer.active
            ? BASE + Math.sin(t * 0.6 + s.seed) * 0.18 // ambient breathing
            : angleLerp(BASE, Math.atan2(dy, dx), 0.35 + influence * 0.65); // point to cursor
        s.a = angleLerp(s.a, target, 0.18);
        const len = STICK + influence * 8;
        const hx = (Math.cos(s.a) * len) / 2;
        const hy = (Math.sin(s.a) * len) / 2;
        ctx.strokeStyle = rgba(theme.rest, theme.hot, influence, theme.restAlpha + influence * (theme.hotAlpha - theme.restAlpha));
        ctx.beginPath();
        ctx.moveTo(s.x - hx, s.y - hy);
        ctx.lineTo(s.x + hx, s.y + hy);
        ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduce) return drawStatic();
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const p = "touches" in e ? e.touches[0] : e;
      if (!p) return;
      const px = p.clientX - rect.left;
      const py = p.clientY - rect.top;
      // Only react while the pointer is over this hero.
      if (px < 0 || py < 0 || px > rect.width || py > rect.height) {
        pointer.active = false;
        return;
      }
      pointer.tx = px;
      pointer.ty = py;
      if (!pointer.active) {
        pointer.x = px;
        pointer.y = py;
      }
      pointer.active = true;
      lastMove = performance.now();
    };
    const onLeave = () => {
      pointer.active = false;
    };

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reduce) drawStatic();
      }, 120);
    };

    // Stop drawing when the hero is scrolled away or the tab is hidden.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start());

    build();
    start();
    io.observe(host);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant]);

  return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 block h-full w-full ${className}`} />;
}
