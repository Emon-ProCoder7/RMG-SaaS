"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { calculateZakat, forecastDemand } from "@/lib/reports/client";
import type { ZakatResult } from "@/lib/reports/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndustrialSectionHeader } from "@/components/industrial/section-header";
import { Card, CardContent } from "@/components/ui/card";

export function ZakatCalculator({
  inventoryValue: initialInventory,
  receivables: initialReceivables,
  payables: initialPayables,
}: {
  inventoryValue: number;
  receivables: number;
  payables: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cash, setCash] = useState(0);
  const [inventory, setInventory] = useState(initialInventory);
  const [receivables, setReceivables] = useState(initialReceivables);
  const [payables, setPayables] = useState(initialPayables);

  const result = calculateZakat(cash, inventory, receivables, payables);

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  return (
    <div ref={ref}>
      <IndustrialSectionHeader title="Zakat Calculator" subtitle="Calculate 2.5% zakat on business assets (Hijri year)" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-card to-green-900/20">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-amber-400">Cash in Bank (BDT)</Label>
                <Input type="number" value={cash} onChange={(e) => setCash(parseFloat(e.target.value) || 0)} className="h-9" /></div>
              <div><Label className="text-xs text-amber-400">Inventory Value (BDT)</Label>
                <Input type="number" value={inventory} onChange={(e) => setInventory(parseFloat(e.target.value) || 0)} className="h-9" /></div>
              <div><Label className="text-xs text-amber-400">Receivables (BDT)</Label>
                <Input type="number" value={receivables} onChange={(e) => setReceivables(parseFloat(e.target.value) || 0)} className="h-9" /></div>
              <div><Label className="text-xs text-amber-400">Payables (BDT)</Label>
                <Input type="number" value={payables} onChange={(e) => setPayables(parseFloat(e.target.value) || 0)} className="h-9" /></div>
            </div>
          </CardContent>
        </Card>

        <ZakatResultCard result={result} />
      </div>
    </div>
  );
}

function ZakatResultCard({ result }: { result: ZakatResult }) {
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (valRef.current) {
      gsap.fromTo(valRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", delay: 0.2 });
    }
  }, [result]);

  return (
    <Card className={cn("border-0 shadow-md overflow-hidden", result.nisabMet ? "bg-gradient-to-br from-card to-green-900/30" : "bg-gradient-to-br from-card to-amber-900/30")}>
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Zakat Due</p>
          <span ref={valRef} className={cn("text-4xl font-bold tabular-nums", result.nisabMet ? "text-green-400" : "text-amber-400")}>
            {result.zakatDue > 0 ? formatCurrency(result.zakatDue) : "—"}
          </span>
          <div className={cn("mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold", result.nisabMet ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300")}>
            {result.nisabMet ? "✓ Nisab threshold met" : "⚠ Below nisab threshold"}
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          {result.details.map((d, i) => (
            <div key={i} className="flex justify-between py-0.5 border-b border-amber-900/20 last:border-0">
              <span className="text-amber-400/70">{d.label}</span>
              <span className={cn("font-medium tabular-nums", d.amount < 0 ? "text-rose-400" : "text-amber-50")}>
                {d.amount < 0 ? `−${formatCurrency(Math.abs(d.amount))}` : formatCurrency(d.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-1 border-t-2 border-amber-700/40">
            <span>Net Zakatable Assets</span><span className="tabular-nums">{formatCurrency(result.totalAssets)}</span>
          </div>
          <div className="flex justify-between text-green-400 font-bold pt-1">
            <span>Zakat @ 2.5%</span><span className="tabular-nums">{result.zakatDue > 0 ? formatCurrency(result.zakatDue) : "0.00"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DemandForecastCard({ history }: { history: { date: string; qty: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [periods, setPeriods] = useState(4);
  const forecast = forecastDemand(history, periods);

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15 });
  }, []);

  const allValues = [...history.map((h) => h.qty), ...forecast.map((f) => f.predicted)];
  const max = Math.max(...allValues, 1);

  return (
    <div ref={ref}>
      <IndustrialSectionHeader title="Demand Forecasting" subtitle="Linear regression based on historical sales" action={
        <div className="flex items-center gap-2">
          <Label className="text-xs text-amber-400">Periods ahead:</Label>
          <Input type="number" min={1} max={12} value={periods} onChange={(e) => setPeriods(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} className="w-16 h-8 text-center" />
        </div>
      } />

      <Card className="border-0 shadow-md overflow-hidden bg-card">
        <CardContent className="p-5">
          <div className="flex items-end gap-2 h-48 mb-2">
            {history.map((h, i) => (
              <div key={`h-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-amber-400/60 tabular-nums">{h.qty}</span>
                <div className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80" style={{
                  height: `${(h.qty / max) * 100}%`,
                  background: "linear-gradient(to top, #3A7A4A, #5A8A5A)",
                  minHeight: 4,
                }} />
                <span className="text-[9px] text-amber-400/50 -rotate-45 origin-left whitespace-nowrap">{h.date}</span>
              </div>
            ))}
            {forecast.map((f, i) => (
              <div key={`f-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-amber-400 font-semibold tabular-nums">{f.predicted}</span>
                <div className="w-full rounded-t-sm opacity-80" style={{
                  height: `${(f.predicted / max) * 100}%`,
                  background: "linear-gradient(to top, #C79F5E, #E8CA7E)",
                  minHeight: 4,
                }} />
                <span className="text-[9px] text-amber-400/70 font-medium">{f.period}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-amber-400/60 mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-600/60" /> Historical</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/80" /> Forecast</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
