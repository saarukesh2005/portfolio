"use client";

import { useMemo, useState } from "react";

type Tool = "loan" | "invest" | "breakeven";

const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const num = (n: number, dp = 2) => n.toLocaleString("en-IN", { maximumFractionDigits: dp });

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-mid">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="w-[96px] rounded-md border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2 py-1 text-right font-mono text-[12.5px] tabular-nums outline-none focus:border-[var(--accent)]"
        />
        {suffix && <span className="w-[26px] text-[11.5px] text-lo">{suffix}</span>}
      </span>
    </label>
  );
}

function Headline({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4">
      <p className="font-mono text-[26px] leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12.5px] text-mid">{caption}</p>
    </div>
  );
}

/** Minimal two-series area chart. No library — nothing to keep up to date. */
function Chart({ a, b, labels }: { a: number[]; b: number[]; labels: string[] }) {
  const W = 520;
  const H = 150;
  const P = { l: 52, r: 10, t: 10, b: 22 };
  const max = Math.max(...a, ...b, 1);
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, a.length - 1);
  const y = (v: number) => P.t + (1 - v / max) * (H - P.t - P.b);
  const path = (s: number[]) => s.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 180 }}>
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={P.t + t * (H - P.t - P.b)} y2={P.t + t * (H - P.t - P.b)} stroke="currentColor" strokeOpacity="0.14" />
          <text x={P.l - 6} y={P.t + t * (H - P.t - P.b) + 3.5} textAnchor="end" className="fill-current font-mono text-[8.5px] opacity-45">
            {Math.round((max * (1 - t)) / 1000).toLocaleString("en-IN")}k
          </text>
        </g>
      ))}
      <path d={`${path(a)} L${x(a.length - 1)} ${H - P.b} L${P.l} ${H - P.b} Z`} fill="var(--accent)" fillOpacity="0.18" />
      <path d={path(a)} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" />
      <path d={path(b)} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.8" strokeDasharray="4 3" />
      {labels.map((l, i) =>
        i % Math.ceil(labels.length / 6) === 0 ? (
          <text key={l} x={x(i)} y={H - 6} textAnchor="middle" className="fill-current font-mono text-[8.5px] opacity-45">
            {l}
          </text>
        ) : null
      )}
    </svg>
  );
}

export default function ToolkitApp() {
  const [tool, setTool] = useState<Tool>("loan");

  /* ── loan ─────────────────────────────────────────────── */
  const [principal, setPrincipal] = useState("2500000");
  const [rate, setRate] = useState("8.75");
  const [years, setYears] = useState("20");

  const loan = useMemo(() => {
    const P = Number(principal) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = (Number(years) || 0) * 12;
    if (P <= 0 || n <= 0) return null;
    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    let balance = P;
    const outstanding: number[] = [];
    const paid: number[] = [];
    const labels: string[] = [];
    let interestTotal = 0;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      interestTotal += interest;
      balance = Math.max(0, balance - (emi - interest));
      if (m % 12 === 0 || m === n) {
        outstanding.push(balance);
        paid.push(P - balance);
        labels.push(`Y${Math.ceil(m / 12)}`);
      }
    }
    return { emi, total: emi * n, interestTotal, outstanding, paid, labels };
  }, [principal, rate, years]);

  /* ── investing ────────────────────────────────────────── */
  const [monthly, setMonthly] = useState("10000");
  const [lumpsum, setLumpsum] = useState("100000");
  const [iRate, setIRate] = useState("12");
  const [iYears, setIYears] = useState("15");

  const invest = useMemo(() => {
    const m = Number(monthly) || 0;
    const L = Number(lumpsum) || 0;
    const r = (Number(iRate) || 0) / 12 / 100;
    const n = (Number(iYears) || 0) * 12;
    if (n <= 0) return null;

    const value: number[] = [];
    const contributed: number[] = [];
    const labels: string[] = [];
    let bal = L;
    for (let k = 1; k <= n; k++) {
      bal = bal * (1 + r) + m;
      if (k % 12 === 0 || k === n) {
        value.push(bal);
        contributed.push(L + m * k);
        labels.push(`Y${Math.ceil(k / 12)}`);
      }
    }
    const invested = L + m * n;
    return { final: bal, invested, gain: bal - invested, value, contributed, labels };
  }, [monthly, lumpsum, iRate, iYears]);

  /* ── break-even ───────────────────────────────────────── */
  const [fixed, setFixed] = useState("500000");
  const [price, setPrice] = useState("1200");
  const [variable, setVariable] = useState("700");

  const be = useMemo(() => {
    const F = Number(fixed) || 0;
    const p = Number(price) || 0;
    const v = Number(variable) || 0;
    const contribution = p - v;
    if (contribution <= 0) return null;
    const units = F / contribution;
    return { units, revenue: units * p, contribution, margin: (contribution / p) * 100 };
  }, [fixed, price, variable]);

  const TABS: { id: Tool; label: string }[] = [
    { id: "loan", label: "Loan / EMI" },
    { id: "invest", label: "SIP & Lumpsum" },
    { id: "breakeven", label: "Break-even" },
  ];

  return (
    <div className="@container flex h-full flex-col">
      <div
        className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-[var(--glass-stroke)] px-4 py-2.5"
        style={{ background: "var(--win-chrome)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12.5px] transition-colors ${
              tool === t.id ? "bg-[var(--accent)] text-white" : "bg-[var(--fill-2)] text-mid hover:bg-[var(--fill-3)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mac-scroll flex-1 overflow-y-auto p-4 @[640px]:p-5">
        {tool === "loan" && (
          <div className="grid gap-4 @[640px]:grid-cols-[270px_1fr]">
            <div className="space-y-2">
              <Field label="Loan amount" value={principal} onChange={setPrincipal} suffix="₹" />
              <Field label="Interest rate" value={rate} onChange={setRate} suffix="%" />
              <Field label="Tenure" value={years} onChange={setYears} suffix="yr" />
            </div>
            {loan ? (
              <div className="space-y-3">
                <div className="grid gap-2 @[520px]:grid-cols-3">
                  <Headline value={money(loan.emi)} caption="per month" />
                  <Headline value={money(loan.interestTotal)} caption="total interest" />
                  <Headline value={money(loan.total)} caption="total repayment" />
                </div>
                <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <p className="mb-1 text-[12px] text-mid">
                    Outstanding (solid) vs principal repaid (dashed)
                  </p>
                  <Chart a={loan.outstanding} b={loan.paid} labels={loan.labels} />
                </div>
                <p className="text-[12px] leading-relaxed text-lo">
                  Interest is {num((loan.interestTotal / (Number(principal) || 1)) * 100, 0)}% of the
                  amount borrowed. Early instalments are mostly interest — that is why prepaying
                  early saves far more than prepaying late.
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-lo">Enter an amount and a tenure.</p>
            )}
          </div>
        )}

        {tool === "invest" && (
          <div className="grid gap-4 @[640px]:grid-cols-[270px_1fr]">
            <div className="space-y-2">
              <Field label="Monthly SIP" value={monthly} onChange={setMonthly} suffix="₹" />
              <Field label="One-off lumpsum" value={lumpsum} onChange={setLumpsum} suffix="₹" />
              <Field label="Expected return" value={iRate} onChange={setIRate} suffix="%" />
              <Field label="Period" value={iYears} onChange={setIYears} suffix="yr" />
            </div>
            {invest ? (
              <div className="space-y-3">
                <div className="grid gap-2 @[520px]:grid-cols-3">
                  <Headline value={money(invest.final)} caption="projected value" />
                  <Headline value={money(invest.invested)} caption="you put in" />
                  <Headline value={money(invest.gain)} caption="growth" />
                </div>
                <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <p className="mb-1 text-[12px] text-mid">Value (solid) vs contributions (dashed)</p>
                  <Chart a={invest.value} b={invest.contributed} labels={invest.labels} />
                </div>
                <p className="text-[12px] leading-relaxed text-lo">
                  Growth is {num((invest.gain / Math.max(1, invest.invested)) * 100, 0)}% of what you
                  contributed. A projection at a constant rate, not a forecast — real returns vary
                  year to year and the order they arrive in matters.
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-lo">Enter a period.</p>
            )}
          </div>
        )}

        {tool === "breakeven" && (
          <div className="grid gap-4 @[640px]:grid-cols-[270px_1fr]">
            <div className="space-y-2">
              <Field label="Fixed costs" value={fixed} onChange={setFixed} suffix="₹" />
              <Field label="Price per unit" value={price} onChange={setPrice} suffix="₹" />
              <Field label="Variable cost / unit" value={variable} onChange={setVariable} suffix="₹" />
            </div>
            {be ? (
              <div className="space-y-3">
                <div className="grid gap-2 @[520px]:grid-cols-3">
                  <Headline value={num(Math.ceil(be.units), 0)} caption="units to break even" />
                  <Headline value={money(be.revenue)} caption="revenue at break-even" />
                  <Headline value={num(be.margin, 1) + "%"} caption="contribution margin" />
                </div>
                <p className="text-[12.5px] leading-relaxed text-mid">
                  Each unit contributes {money(be.contribution)} towards fixed costs. Past{" "}
                  {num(Math.ceil(be.units), 0)} units, that contribution becomes profit.
                </p>
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-amber-400">
                Price must exceed variable cost per unit — otherwise every sale deepens the loss and
                there is no break-even point.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
