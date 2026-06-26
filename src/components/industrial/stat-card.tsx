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
  accentColor?: "indigo" | "amber" | "emerald" | "rose";
};

const ACCENTS = {
  indigo: "from-indigo-600/20 via-indigo-600/5 to-transparent border-indigo-200/30",
  amber: "from-amber-500/20 via-amber-500/5 to-transparent border-amber-200/30",
  emerald: "from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-200/30",
  rose: "from-rose-500/20 via-rose-500/5 to-transparent border-rose-200/30",
};

const ICON_BG = {
  indigo: "bg-indigo-100 text-indigo-700",
  amber: "bg-amber-100 text-amber-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
};

export function IndustrialStatCard({ title, value, subtitle, trend, icon, className, accentColor = "indigo" }: Props) {
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
      {/* Industrial corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16">
        <div className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-current to-transparent opacity-30" />
        <div className="absolute top-0 right-0 w-0.5 h-8 bg-gradient-to-b from-current to-transparent opacity-30" />
      </div>

      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-indigo-500/70">{title}</span>
        <div className={cn("p-2 rounded-lg", ICON_BG[accentColor])}>{icon}</div>
      </div>

      <span ref={valRef} className="block text-3xl font-bold tracking-tight text-indigo-900 tabular-nums">{value}</span>

      <div className="flex items-center gap-2 mt-1.5">
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded",
            trend.dir === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
          )}>
            {trend.dir === "up" ? "↑" : "↓"} {trend.pct}
          </span>
        )}
        {subtitle && <span className="text-[11px] text-indigo-400/70">{subtitle}</span>}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-indigo-100/30 bg-white/50 p-5">
      <div className="h-3 w-24 bg-indigo-200/30 rounded mb-3" />
      <div className="h-8 w-32 bg-indigo-200/20 rounded mb-2" />
      <div className="h-3 w-20 bg-indigo-200/20 rounded" />
    </div>
  );
}
