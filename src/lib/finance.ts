/**
 * The harder finance maths — numerical root-finding, amortisation under
 * prepayments and rate changes, and the multi-factor diagnostic models.
 *
 * Nothing here has a closed form you can just type out: IRR and XIRR need
 * iteration, and a loan with prepayments has to be simulated month by month
 * because each prepayment changes every instalment that follows.
 */

/* ────────────────────── root finding ────────────────────── */

/**
 * Newton–Raphson with a bisection fallback.
 *
 * Newton is fast but can diverge badly on awkward cashflow shapes, so when it
 * fails to converge we fall back to bisection, which is slower but cannot
 * run away as long as the interval brackets a sign change.
 */
export function solve(
  f: (x: number) => number,
  { guess = 0.1, lo = -0.9999, hi = 10, tol = 1e-7, maxIter = 100 } = {}
): number | null {
  // Newton first
  let x = guess;
  for (let i = 0; i < maxIter; i++) {
    const fx = f(x);
    if (!Number.isFinite(fx)) break;
    if (Math.abs(fx) < tol) return x;
    const h = 1e-6;
    const d = (f(x + h) - fx) / h;
    if (!Number.isFinite(d) || Math.abs(d) < 1e-12) break;
    const next = x - fx / d;
    if (!Number.isFinite(next) || next <= lo) break;
    if (Math.abs(next - x) < tol) return next;
    x = next;
  }

  // bisection — needs the interval to bracket a root
  let a = lo;
  let b = hi;
  let fa = f(a);
  let fb = f(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb) || fa * fb > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (a + b) / 2;
    const fm = f(mid);
    if (!Number.isFinite(fm)) return null;
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid;
    if (fa * fm < 0) {
      b = mid;
      fb = fm;
    } else {
      a = mid;
      fa = fm;
    }
  }
  return (a + b) / 2;
}

/* ────────────────────── NPV / IRR / XIRR ────────────────────── */

export const npv = (rate: number, flows: number[]) =>
  flows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + rate, t), 0);

/** IRR for evenly spaced periods. Returns null when no sign change exists. */
export function irr(flows: number[]): number | null {
  if (flows.length < 2) return null;
  const hasPos = flows.some((f) => f > 0);
  const hasNeg = flows.some((f) => f < 0);
  if (!hasPos || !hasNeg) return null; // an all-positive or all-negative series has no IRR
  return solve((r) => npv(r, flows), { guess: 0.1 });
}

export type DatedFlow = { date: Date; amount: number };

/** Present value of dated flows, Act/365 — the convention Excel's XIRR uses. */
export function xnpv(rate: number, flows: DatedFlow[]): number {
  const t0 = flows[0].date.getTime();
  return flows.reduce((sum, f) => {
    const years = (f.date.getTime() - t0) / (365 * 24 * 3600 * 1000);
    return sum + f.amount / Math.pow(1 + rate, years);
  }, 0);
}

/** IRR for irregularly timed cashflows — what analysts actually need. */
export function xirr(flows: DatedFlow[]): number | null {
  if (flows.length < 2) return null;
  const sorted = [...flows].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!sorted.some((f) => f.amount > 0) || !sorted.some((f) => f.amount < 0)) return null;
  return solve((r) => xnpv(r, sorted), { guess: 0.1 });
}

/** Years until a series of flows turns cumulatively positive, interpolated. */
export function paybackPeriod(flows: number[]): number | null {
  let cum = 0;
  for (let i = 0; i < flows.length; i++) {
    const prev = cum;
    cum += flows[i];
    if (prev < 0 && cum >= 0) return i - 1 + Math.abs(prev) / Math.abs(flows[i]);
  }
  return null;
}

/* ────────────────────── amortisation ────────────────────── */

export type Prepayment = { month: number; amount: number; recurring: boolean };
export type RateChange = { month: number; rate: number };

export type LoanPlan = {
  principal: number;
  annualRate: number;
  months: number;
  prepayments?: Prepayment[];
  rateChanges?: RateChange[];
  /** a prepayment either shortens the loan or shrinks the instalment */
  onPrepay?: "reduce-tenure" | "reduce-emi";
};

export type LoanResult = {
  emi: number;
  monthsTaken: number;
  totalPaid: number;
  totalInterest: number;
  schedule: { month: number; opening: number; interest: number; principal: number; extra: number; closing: number }[];
};

const flatEmi = (p: number, r: number, n: number) =>
  r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

/**
 * Month-by-month simulation. A prepayment, or a rate reset, changes every
 * instalment after it, so this cannot be done with one closed-form EMI.
 */
export function amortise(plan: LoanPlan): LoanResult | null {
  const { principal, annualRate, months, prepayments = [], rateChanges = [], onPrepay = "reduce-tenure" } = plan;
  if (principal <= 0 || months <= 0) return null;

  let rate = annualRate / 12 / 100;
  let emi = flatEmi(principal, rate, months);
  const firstEmi = emi;

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: LoanResult["schedule"] = [];

  for (let m = 1; m <= months * 2 && balance > 0.5; m++) {
    const change = rateChanges.find((c) => c.month === m);
    if (change) {
      rate = change.rate / 12 / 100;
      // re-price over whatever tenure is left
      emi = flatEmi(balance, rate, Math.max(1, months - m + 1));
    }

    const opening = balance;
    const interest = opening * rate;
    const principalPart = Math.min(emi - interest, opening);
    if (principalPart < 0) return null; // instalment does not even cover interest

    let extra = 0;
    for (const p of prepayments) {
      if (p.recurring ? m >= p.month && (m - p.month) % 12 === 0 : p.month === m) extra += p.amount;
    }
    extra = Math.min(extra, Math.max(0, opening - principalPart));

    balance = opening - principalPart - extra;
    totalInterest += interest;
    totalPaid += interest + principalPart + extra;

    if (extra > 0 && onPrepay === "reduce-emi" && balance > 0) {
      emi = flatEmi(balance, rate, Math.max(1, months - m));
    }

    schedule.push({ month: m, opening, interest, principal: principalPart, extra, closing: balance });
    if (balance <= 0.5) break;
  }

  return { emi: firstEmi, monthsTaken: schedule.length, totalPaid, totalInterest, schedule };
}

/* ────────────────────── goal seek ────────────────────── */

/** Monthly contribution needed to reach a target. */
export function requiredSip(target: number, annualRate: number, years: number, lumpsum = 0): number | null {
  const r = annualRate / 12 / 100;
  const n = years * 12;
  if (n <= 0) return null;
  const fvLump = lumpsum * Math.pow(1 + r, n);
  const need = target - fvLump;
  if (need <= 0) return 0;
  if (r === 0) return need / n;
  return need / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

/** Annual return needed to reach a target — solved numerically. */
export function requiredReturn(target: number, monthly: number, years: number, lumpsum = 0): number | null {
  const n = years * 12;
  if (n <= 0) return null;
  const fv = (annual: number) => {
    const r = annual / 12 / 100;
    const lump = lumpsum * Math.pow(1 + r, n);
    const sip = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return lump + sip - target;
  };
  return solve(fv, { guess: 10, lo: -99, hi: 200, tol: 1e-5 });
}

/** Real (inflation-adjusted) return — Fisher, not the sloppy subtraction. */
export const realReturn = (nominal: number, inflation: number) =>
  ((1 + nominal / 100) / (1 + inflation / 100) - 1) * 100;

/* ────────────────────── diagnostics ────────────────────── */

export type DuPont = {
  roe: number;
  taxBurden: number;
  interestBurden: number;
  operatingMargin: number;
  assetTurnover: number;
  equityMultiplier: number;
} | null;

/** Five-step DuPont: splits ROE into the five levers that actually move it. */
export function dupont(f: {
  netProfit: number | null;
  operatingProfit: number | null;
  interest: number | null;
  revenue: number | null;
  totalAssets: number | null;
  equity: number | null;
}): DuPont {
  const { netProfit, operatingProfit, interest, revenue, totalAssets, equity } = f;
  if ([netProfit, operatingProfit, revenue, totalAssets, equity].some((v) => v === null)) return null;
  const pbt = operatingProfit! - (interest ?? 0);
  if (pbt === 0 || operatingProfit === 0 || revenue === 0 || totalAssets === 0 || equity === 0) return null;

  const taxBurden = netProfit! / pbt;
  const interestBurden = pbt / operatingProfit!;
  const operatingMargin = operatingProfit! / revenue!;
  const assetTurnover = revenue! / totalAssets!;
  const equityMultiplier = totalAssets! / equity!;

  return {
    roe: taxBurden * interestBurden * operatingMargin * assetTurnover * equityMultiplier * 100,
    taxBurden,
    interestBurden,
    operatingMargin,
    assetTurnover,
    equityMultiplier,
  };
}

export type Altman = { z: number; zone: "Safe" | "Grey" | "Distress"; parts: { k: string; v: number }[] } | null;

/**
 * Altman Z'-score, the private-company revision that uses book equity rather
 * than market capitalisation — the right variant here, since this tool has a
 * balance sheet and not a share price.
 */
export function altmanZ(f: {
  currentAssets: number | null;
  currentLiabilities: number | null;
  totalAssets: number | null;
  retainedEarnings: number | null;
  operatingProfit: number | null;
  equity: number | null;
  revenue: number | null;
}): Altman {
  const { currentAssets, currentLiabilities, totalAssets, retainedEarnings, operatingProfit, equity, revenue } = f;
  if ([currentAssets, currentLiabilities, totalAssets, retainedEarnings, operatingProfit, equity, revenue].some((v) => v === null))
    return null;
  if (!totalAssets || totalAssets === 0) return null;

  const liabilities = totalAssets - equity!;
  if (liabilities <= 0) return null;

  const x1 = (currentAssets! - currentLiabilities!) / totalAssets;
  const x2 = retainedEarnings! / totalAssets;
  const x3 = operatingProfit! / totalAssets;
  const x4 = equity! / liabilities;
  const x5 = revenue! / totalAssets;

  const z = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.42 * x4 + 0.998 * x5;
  const zone = z > 2.9 ? "Safe" : z >= 1.23 ? "Grey" : "Distress";

  return {
    z,
    zone,
    parts: [
      { k: "Working capital / assets", v: x1 },
      { k: "Retained earnings / assets", v: x2 },
      { k: "EBIT / assets", v: x3 },
      { k: "Equity / liabilities", v: x4 },
      { k: "Sales / assets", v: x5 },
    ],
  };
}

export type CashCycle = { dio: number; dso: number; dpo: number; ccc: number } | null;

/** Cash conversion cycle — how long cash is tied up before it comes back. */
export function cashCycle(f: {
  inventory: number | null;
  cogs: number | null;
  receivables: number | null;
  revenue: number | null;
  payables: number | null;
}): CashCycle {
  const { inventory, cogs, receivables, revenue, payables } = f;
  if ([inventory, cogs, receivables, revenue, payables].some((v) => v === null)) return null;
  if (!cogs || !revenue) return null;
  const dio = (inventory! / cogs) * 365;
  const dso = (receivables! / revenue) * 365;
  const dpo = (payables! / cogs) * 365;
  return { dio, dso, dpo, ccc: dio + dso - dpo };
}
