"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function IndustrialBgShapes() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const shapes = c.querySelectorAll(".industrial-shape");
    gsap.fromTo(shapes, { opacity: 0, scale: 0.6 }, {
      opacity: 0.12, scale: 1, duration: 1.8, stagger: 0.15, ease: "power3.out", delay: 0.2,
    });
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      {/* Large hexagon */}
      <div className="industrial-shape absolute -top-32 -right-32 w-96 h-96 border-2 border-indigo-300/20 rounded-[40%_60%_50%_50%_/50%_40%_60%_50%] rotate-12" />
      {/* Diagonal stripe */}
      <div className="industrial-shape absolute top-1/4 -left-20 w-64 h-1.5 bg-gradient-to-r from-amber-400/20 to-transparent -rotate-45" />
      <div className="industrial-shape absolute top-2/3 right-12 w-48 h-1 bg-gradient-to-l from-indigo-400/15 to-transparent -rotate-[30deg]" />
      {/* Diamond */}
      <div className="industrial-shape absolute bottom-20 left-1/4 w-32 h-32 border border-amber-400/10 rotate-45 rounded-sm" />
      {/* Circle segment */}
      <div className="industrial-shape absolute top-1/3 right-1/3 w-24 h-24 rounded-full border-4 border-indigo-400/8" />
      {/* Grid dots */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #1E3A5F 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
    </div>
  );
}
