"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { dir: "up" | "down"; pct: string };
  icon: React.ReactNode;
  className?: string;
  accentColor?: "gold" | "amber" | "green" | "rose";
};

const ACCENTS = {
  gold: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-700/30",
  amber: "from-amber-400/15 via-amber-400/5 to-transparent border-amber-600/25",
  green: "from-green-500/20 via-green-500/5 to-transparent border-green-700/30",
  rose: "from-rose-500/20 via-rose-500/5 to-transparent border-rose-700/30",
};

const ICON_BG = {
  gold: "bg-amber-500/20 text-amber-300",
  amber: "bg-amber-400/15 text-amber-200",
  green: "bg-green-500/20 text-green-300",
  rose: "bg-rose-500/20 text-rose-300",
};

export function IndustrialStatCard({ title, value, subtitle, trend, icon, className, accentColor = "gold" }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(card, { opacity: 0, y: 40, rotateX: 5 }, {
      opacity: 1, y: 0, rotateX: 0, duration: 0.7, ease: "power3.out",
    });
    if (valRef.current) {
      gsap.fromTo(valRef.current, { opacity: 0, y: 12 }, {
        opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: "power2.out",
      });
    }
  }, []);

  return (
    <div ref={cardRef} className={cn(
      "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
      ACCENTS[accentColor],
      className
    )}>
      <div className="absolute top-0 right-0 w-16 h-16">
        <div className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-current to-transparent opacity-30" />
        <div className="absolute top-0 right-0 w-0.5 h-8 bg-gradient-to-b from-current to-transparent opacity-30" />
      </div>

      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-400/70">{title}</span>
        <div className={cn("p-2 rounded-lg", ICON_BG[accentColor])}>{icon}</div>
      </div>

      <span ref={valRef} className="block text-3xl font-bold tracking-tight text-amber-50 tabular-nums">{value}</span>

      <div className="flex items-center gap-2 mt-1.5">
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded",
            trend.dir === "up" ? "text-green-300 bg-green-500/15" : "text-rose-300 bg-rose-500/15"
          )}>
            {trend.dir === "up" ? "↑" : "↓"} {trend.pct}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-amber-400/60">{subtitle}</span>}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-amber-800/20 bg-card p-5">
      <div className="h-3 w-24 bg-amber-800/20 rounded mb-3" />
      <div className="h-8 w-32 bg-amber-800/15 rounded mb-2" />
      <div className="h-3 w-20 bg-amber-800/15 rounded" />
    </div>
  );
}
