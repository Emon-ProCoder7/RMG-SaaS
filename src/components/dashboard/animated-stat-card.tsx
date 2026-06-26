"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  subtitle?: string;
};

export function AnimatedStatCard({ title, value, icon, subtitle }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(card, { opacity: 0, y: 30, scale: 0.95 }, {
      opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)",
    });
    if (valueRef.current) {
      const num = parseFloat(value.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(num)) {
        gsap.fromTo(valueRef.current, { opacity: 0 }, {
          opacity: 1, duration: 0.6, delay: 0.3, ease: "power2.out",
        });
      }
    }
  }, [value]);

  return (
    <Card ref={cardRef} className="border-0 bg-gradient-to-br from-white/90 to-amber-50/40 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-indigo-800/70">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <p ref={valueRef} className="text-3xl font-bold tracking-tight text-indigo-900">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
