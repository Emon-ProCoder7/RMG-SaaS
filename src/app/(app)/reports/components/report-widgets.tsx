"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { calculateZakat, forecastDemand, getMockSalesHistory } from "@/lib/reports";
import type { ZakatResult } from "@/lib/reports";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndustrialSectionHeader } from "@/components/industrial/section-header";
import { Card, CardContent } from "@/components/ui/card";

export function ZakatCalculator() {
  const ref = useRef<HTMLDivElement>(null);
  const [cash, setCash] = useState(2500000);
  const [inventory, setInventory] = useState(3800000);
  const [receivables, setReceivables] = useState(950000);
  const [payables, setPayables] = useState(1200000);

  const result = calculateZakat(cash, inventory, receivables, payables);

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
  }, []);

  return (
    <div ref={ref}>
      <IndustrialSectionHeader title="Zakat Calculator" subtitle="Calculate 2.5% zakat on business assets (Hijri year)" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-white to-emerald-50/40">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs text-indigo-500">Cash in Bank (BDT)</Label>
                <Input type="number" value={cash} onChange={(e) => setCash(parseFloat(e.target.value) || 0)} className="border-indigo-200 h-9" /></div>
              <div><Label className="text-xs text-indigo-500">Inventory Value (BDT)</Label>
                <Input type="number" value={inventory} onChange={(e) => setInventory(parseFloat(e.target.value) || 0)} className="border-indigo-200 h-9" /></div>
              <div><Label className="text-xs text-indigo-500">Receivables (BDT)</Label>
                <Input type="number" value={receivables} onChange={(e) => setReceivables(parseFloat(e.target.value) || 0)} className="border-indigo-200 h-9" /></div>
              <div><Label className="text-xs text-indigo-500">Payables (BDT)</Label>
                <Input type="number" value={payables} onChange={(e) => setPayables(parseFloat(e.target.value) || 0)} className="border-indigo-200 h-9" /></div>
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
    <Card className={cn("border-0 shadow-md overflow-hidden", result.nisabMet ? "bg-gradient-to-br from-white to-emerald-50" : "bg-gradient-to-br from-white to-amber-50")}>
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <p className="text-xs text-indigo-400 uppercase tracking-wider mb-1">Zakat Due</p>
          <span ref={valRef} className={cn("text-4xl font-bold tabular-nums", result.nisabMet ? "text-emerald-700" : "text-amber-600")}>
            {result.zakatDue > 0 ? formatCurrency(result.zakatDue) : "—"}
          </span>
          <div className={cn("mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold", result.nisabMet ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
            {result.nisabMet ? "✓ Nisab threshold met" : "⚠ Below nisab threshold"}
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          {result.details.map((d, i) => (
            <div key={i} className="flex justify-between py-0.5 border-b border-gray-50 last:border-0">
              <span className="text-indigo-600/70">{d.label}</span>
              <span className={cn("font-medium tabular-nums", d.amount < 0 ? "text-red-600" : "text-indigo-900")}>
                {d.amount < 0 ? `−${formatCurrency(Math.abs(d.amount))}` : formatCurrency(d.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-1 border-t-2 border-indigo-200">
            <span>Net Zakatable Assets</span><span className="tabular-nums">{formatCurrency(result.totalAssets)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 font-bold pt-1">
            <span>Zakat @ 2.5%</span><span className="tabular-nums">{result.zakatDue > 0 ? formatCurrency(result.zakatDue) : "0.00"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DemandForecastCard() {
  const ref = useRef<HTMLDivElement>(null);
  const history = getMockSalesHistory();
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
          <Label className="text-xs text-indigo-400">Periods ahead:</Label>
          <Input type="number" min={1} max={12} value={periods} onChange={(e) => setPeriods(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))} className="w-16 h-8 text-center border-indigo-200" />
        </div>
      } />

      <Card className="border-0 shadow-md overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-end gap-2 h-48 mb-2">
            {history.map((h, i) => (
              <div key={`h-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-indigo-400 tabular-nums">{h.qty}</span>
                <div className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80" style={{
                  height: `${(h.qty / max) * 100}%`,
                  background: "linear-gradient(to top, #1E3A5F, #3B5F8A)",
                  minHeight: 4,
                }} />
                <span className="text-[9px] text-indigo-400/60 -rotate-45 origin-left whitespace-nowrap">{h.date}</span>
              </div>
            ))}
            {forecast.map((f, i) => (
              <div key={`f-${i}`} className="flex-1 flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-amber-600 font-semibold tabular-nums">{f.predicted}</span>
                <div className="w-full rounded-t-sm opacity-80" style={{
                  height: `${(f.predicted / max) * 100}%`,
                  background: "linear-gradient(to top, #D4A843, #E8C468)",
                  minHeight: 4,
                }} />
                <span className="text-[9px] text-amber-600/70 font-medium">{f.period}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs text-indigo-400 mt-1">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-600/60" /> Historical</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/80" /> Forecast</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
