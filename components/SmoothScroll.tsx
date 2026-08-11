"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Buttery momentum scrolling (Lenis) for public marketing pages. Mount once
 * per page. It bails out under prefers-reduced-motion, so those visitors keep
 * native scroll, and it only affects the page it is mounted on, never the
 * logged-in app. The `duration` here is the single knob for the scroll feel:
 * higher = slower/heavier glide, lower = snappier.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
