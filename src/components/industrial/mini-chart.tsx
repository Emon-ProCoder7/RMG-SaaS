"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Props = { data: number[]; height?: number; color?: string };

export function MiniBarChart({ data, height = 40, color = "#D4A843" }: Props) {
  const barsRef = useRef<HTMLDivElement>(null);
  const max = Math.max(...data, 1);

  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll<HTMLDivElement>(".mini-bar");
    gsap.fromTo(bars, { scaleY: 0, transformOrigin: "bottom" }, {
      scaleY: 1, duration: 0.6, stagger: 0.04, ease: "back.out(1.7)", delay: 0.3,
    });
  }, [data]);

  return (
    <div ref={barsRef} className="flex items-end gap-[3px]" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="mini-bar flex-1 rounded-t-sm" style={{
          height: `${(v / max) * 100}%`,
          background: `linear-gradient(to top, ${color}88, ${color})`,
          minHeight: v > 0 ? 4 : 0,
        }} />
      ))}
    </div>
  );
}
