export type ForecastPoint = { period: string; actual: number; predicted: number | null };
export type ZakatResult = { totalAssets: number; zakatDue: number; nisabMet: boolean; details: ZakatDetail[] };
type ZakatDetail = { label: string; amount: number };

export function forecastDemand(sales: { date: string; qty: number }[], periodsAhead = 4): { period: string; predicted: number }[] {
  if (sales.length < 2) return [];
  const values = sales.map((s) => s.qty);
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;
  const result: { period: string; predicted: number }[] = [];
  for (let i = 1; i <= periodsAhead; i++) {
    const pred = Math.max(0, Math.round(intercept + slope * (n - 1 + i)));
    result.push({ period: `Period ${n + i}`, predicted: pred });
  }
  return result;
}

export function calculateZakat(cashInBank: number, inventoryValue: number, receivables: number, payables: number): ZakatResult {
  const inventoryZakatable = inventoryValue * 0.85;
  const totalAssets = cashInBank + inventoryZakatable + receivables;
  const netZakatable = Math.max(0, totalAssets - payables);
  const nisabThreshold = 500000;
  const nisabMet = netZakatable >= nisabThreshold;
  const zakatDue = nisabMet ? netZakatable * 0.025 : 0;
  return {
    totalAssets: netZakatable,
    zakatDue: Math.round(zakatDue * 100) / 100,
    nisabMet,
    details: [
      { label: "Cash in Bank", amount: cashInBank },
      { label: "Inventory (85% zakatable)", amount: inventoryZakatable },
      { label: "Accounts Receivable", amount: receivables },
      { label: "Less: Accounts Payable", amount: -payables },
    ],
  };
}
