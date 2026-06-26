"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = { title: string; subtitle?: string; action?: React.ReactNode; className?: string };

export function IndustrialSectionHeader({ title, subtitle, action, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  return (
    <div ref={ref} className={cn("flex items-end justify-between mb-5", className)}>
      <div>
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-gradient-to-b from-amber-500 to-amber-300 rounded-full" />
          <h2 className="text-lg font-bold text-amber-50 tracking-tight">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-amber-400/60 mt-1 ml-4">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
