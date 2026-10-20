"use client";

import { useMemo, useState } from "react";

import { amortise, irr, npv, paybackPeriod, realReturn, requiredReturn, requiredSip, xirr } from "@/lib/finance";

type Tool = "loan" | "invest" | "breakeven" | "cashflow";

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

  const [prepay, setPrepay] = useState("0");
  const [prepayMonth, setPrepayMonth] = useState("12");
  const [prepayEvery, setPrepayEvery] = useState(true);
  const [strategy, setStrategy] = useState<"reduce-tenure" | "reduce-emi">("reduce-tenure");

  const loan = useMemo(() => {
    const P = Number(principal) || 0;
    const n = (Number(years) || 0) * 12;
    const extra = Number(prepay) || 0;
    const from = Math.max(1, Number(prepayMonth) || 1);

    const base = amortise({ principal: P, annualRate: Number(rate) || 0, months: n });
    if (!base) return null;

    const withPrepay =
      extra > 0
        ? amortise({
            principal: P,
            annualRate: Number(rate) || 0,
            months: n,
            prepayments: [{ month: from, amount: extra, recurring: prepayEvery }],
            onPrepay: strategy,
          })
        : null;

    const plan = withPrepay ?? base;
    const yearly = plan.schedule.filter((row, i) => (i + 1) % 12 === 0 || i === plan.schedule.length - 1);

    return {
      ...plan,
      saved: withPrepay ? base.totalInterest - withPrepay.totalInterest : 0,
      monthsSaved: withPrepay ? base.monthsTaken - withPrepay.monthsTaken : 0,
      outstanding: yearly.map((r) => r.closing),
      paid: yearly.map((r) => P - r.closing),
      labels: yearly.map((_, i) => `Y${i + 1}`),
    };
  }, [principal, rate, years, prepay, prepayMonth, prepayEvery, strategy]);

  /* ── investing ────────────────────────────────────────── */
  const [monthly, setMonthly] = useState("10000");
  const [lumpsum, setLumpsum] = useState("100000");
  const [iRate, setIRate] = useState("12");
  const [iYears, setIYears] = useState("15");
  const [goal, setGoal] = useState("10000000");
  const [inflation, setInflation] = useState("6");

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

  /* ── cashflows ────────────────────────────────────────── */
  const [flowText, setFlowText] = useState(
    "2024-01-01  -1000000\n2024-06-15   250000\n2025-01-10   400000\n2025-09-20   350000\n2026-03-01   300000"
  );
  const [discount, setDiscount] = useState("10");

  const flows = useMemo(() => {
    const rows = flowText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const m = l.match(/^(\d{4}-\d{2}-\d{2})?\s*(-?[\d,.]+)/);
        if (!m) return null;
        const amount = Number(m[2].replace(/,/g, ""));
        if (!Number.isFinite(amount)) return null;
        return { date: m[1] ? new Date(m[1]) : null, amount };
      })
      .filter(Boolean) as { date: Date | null; amount: number }[];

    if (rows.length < 2) return null;
    const dated = rows.every((r) => r.date && !Number.isNaN(r.date.getTime()));
    const amounts = rows.map((r) => r.amount);

    return {
      count: rows.length,
      dated,
      npv: npv((Number(discount) || 0) / 100, amounts),
      irr: irr(amounts),
      xirr: dated ? xirr(rows.map((r) => ({ date: r.date!, amount: r.amount }))) : null,
      payback: paybackPeriod(amounts),
      invested: amounts.filter((a) => a < 0).reduce((s, a) => s + a, 0),
      returned: amounts.filter((a) => a > 0).reduce((s, a) => s + a, 0),
    };
  }, [flowText, discount]);

  const TABS: { id: Tool; label: string }[] = [
    { id: "loan", label: "Loan / EMI" },
    { id: "invest", label: "SIP & Lumpsum" },
    { id: "breakeven", label: "Break-even" },
    { id: "cashflow", label: "NPV / IRR / XIRR" },
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

              <p className="pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">Prepayment</p>
              <Field label="Extra payment" value={prepay} onChange={setPrepay} suffix="₹" />
              <Field label="From month" value={prepayMonth} onChange={setPrepayMonth} suffix="m" />
              <label className="flex items-center justify-between gap-2 text-[12.5px] text-mid">
                Repeat yearly
                <input
                  type="checkbox"
                  checked={prepayEvery}
                  onChange={(e) => setPrepayEvery(e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>
              <div className="flex gap-1.5 pt-1">
                {(["reduce-tenure", "reduce-emi"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setStrategy(v)}
                    className={`flex-1 rounded-md px-2 py-1 text-[11.5px] transition-colors ${
                      strategy === v ? "bg-[var(--accent)] text-white" : "bg-[var(--fill-2)] text-mid hover:bg-[var(--fill-3)]"
                    }`}
                  >
                    {v === "reduce-tenure" ? "Cut tenure" : "Cut EMI"}
                  </button>
                ))}
              </div>
            </div>
            {loan ? (
              <div className="space-y-3">
                <div className="grid gap-2 @[520px]:grid-cols-3">
                  <Headline value={money(loan.emi)} caption="per month" />
                  <Headline value={money(loan.totalInterest)} caption="total interest" />
                  <Headline value={money(loan.totalPaid)} caption="total repayment" />
                </div>
                {loan.saved > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                    <p className="text-[13px] text-emerald-300">
                      Prepaying saves <strong>{money(loan.saved)}</strong> in interest
                      {loan.monthsSaved > 0 && (
                        <> and clears the loan {Math.floor(loan.monthsSaved / 12)}y {loan.monthsSaved % 12}m early</>
                      )}
                      .
                    </p>
                  </div>
                )}
                <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <p className="mb-1 text-[12px] text-mid">
                    Outstanding (solid) vs principal repaid (dashed)
                  </p>
                  <Chart a={loan.outstanding} b={loan.paid} labels={loan.labels} />
                </div>
                <p className="text-[12px] leading-relaxed text-lo">
                  Interest is {num((loan.totalInterest / (Number(principal) || 1)) * 100, 0)}% of the
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
              <Field label="Inflation" value={inflation} onChange={setInflation} suffix="%" />

              <p className="pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">Goal seek</p>
              <Field label="Target corpus" value={goal} onChange={setGoal} suffix="₹" />
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
                <div className="grid gap-2 @[520px]:grid-cols-2">
                  <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-lo">To reach {money(Number(goal) || 0)}</p>
                    {(() => {
                      const need = requiredSip(Number(goal) || 0, Number(iRate) || 0, Number(iYears) || 0, Number(lumpsum) || 0);
                      const rr = requiredReturn(Number(goal) || 0, Number(monthly) || 0, Number(iYears) || 0, Number(lumpsum) || 0);
                      return (
                        <ul className="space-y-1 text-[12.5px] text-mid">
                          <li>
                            invest <strong className="font-mono">{need === null ? "—" : money(need)}</strong>/month at {num(Number(iRate) || 0, 1)}%
                          </li>
                          <li>
                            or earn <strong className="font-mono">{rr === null ? "—" : num(rr, 2) + "%"}</strong> on {money(Number(monthly) || 0)}/month
                          </li>
                        </ul>
                      );
                    })()}
                  </div>
                  <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-lo">After inflation</p>
                    <p className="text-[12.5px] text-mid">
                      real return <strong className="font-mono">{num(realReturn(Number(iRate) || 0, Number(inflation) || 0), 2)}%</strong>
                      {" "}· {money(invest.final / Math.pow(1 + (Number(inflation) || 0) / 100, Number(iYears) || 0))} in today&rsquo;s money
                    </p>
                  </div>
                </div>
                <p className="text-[12px] leading-relaxed text-lo">
                  Growth is {num((invest.gain / Math.max(1, invest.invested)) * 100, 0)}% of what you
                  contributed. A projection at a constant rate, not a forecast — real returns vary
                  year to year, and the order they arrive in matters. Real return uses Fisher, not
                  nominal minus inflation.
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-lo">Enter a period.</p>
            )}
          </div>
        )}

        {tool === "cashflow" && (
          <div className="grid gap-4 @[640px]:grid-cols-[270px_1fr]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-lo">
                Cashflows — one per line
              </p>
              <textarea
                value={flowText}
                onChange={(e) => setFlowText(e.target.value)}
                aria-label="Cashflows"
                className="mac-scroll h-[190px] w-full resize-none rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-2.5 font-mono text-[12px] leading-relaxed outline-none focus:border-[var(--accent)]"
              />
              <p className="text-[11px] leading-relaxed text-lo">
                <code>YYYY-MM-DD amount</code>, outflows negative. Drop the dates and it treats them
                as equal periods.
              </p>
              <Field label="Discount rate" value={discount} onChange={setDiscount} suffix="%" />
            </div>

            {flows ? (
              <div className="space-y-3">
                <div className="grid gap-2 @[520px]:grid-cols-3">
                  <Headline value={money(flows.npv)} caption={`NPV at ${num(Number(discount) || 0, 1)}%`} />
                  <Headline
                    value={flows.xirr !== null ? num(flows.xirr * 100, 2) + "%" : flows.irr !== null ? num(flows.irr * 100, 2) + "%" : "—"}
                    caption={flows.xirr !== null ? "XIRR (actual dates)" : "IRR (equal periods)"}
                  />
                  <Headline
                    value={flows.payback !== null ? num(flows.payback, 2) : "—"}
                    caption="periods to payback"
                  />
                </div>

                <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3 text-[12.5px] text-mid">
                  <p>
                    {flows.count} flows · {money(Math.abs(flows.invested))} out ·{" "}
                    {money(flows.returned)} back
                    {flows.dated ? " · dated, so XIRR applies" : " · undated, so equal periods assumed"}
                  </p>
                  <p className={`mt-1.5 ${flows.npv >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {flows.npv >= 0
                      ? `Positive NPV — the project clears a ${num(Number(discount) || 0, 1)}% hurdle rate.`
                      : `Negative NPV — the project does not clear a ${num(Number(discount) || 0, 1)}% hurdle rate.`}
                  </p>
                </div>

                <p className="text-[12px] leading-relaxed text-lo">
                  IRR is found numerically — Newton&ndash;Raphson, falling back to bisection when it
                  will not converge. A series that never changes sign has no IRR, and one that
                  changes sign more than once can have several; NPV at a stated hurdle rate is the
                  more reliable read in both cases.
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-lo">Enter at least two cashflows.</p>
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
