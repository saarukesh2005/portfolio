"use client";

import { useMemo, useState } from "react";
import {
  bufferCheck, compareStrategies, dueThisMonth, effectiveRate, minimumOnly, stressTest,
  type Debt, type DebtKind, type Profile,
} from "@/lib/debt";

const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const term = (m: number) => `${Math.floor(m / 12)}y ${m % 12}m`;

const KINDS: { id: DebtKind; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "education", label: "Education" },
  { id: "auto", label: "Auto" },
  { id: "personal", label: "Personal" },
  { id: "card", label: "Credit card" },
  { id: "other", label: "Other" },
];

const SEED: Debt[] = [
  { id: "d1", name: "Credit card", balance: 80000, annualRate: 42, payment: 2000, kind: "card", minPercent: 5 },
  { id: "d2", name: "Personal loan", balance: 300000, annualRate: 14, payment: 10000, kind: "personal" },
  { id: "d3", name: "Car loan", balance: 500000, annualRate: 11, payment: 12000, kind: "auto" },
];

function Num({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="flex items-center gap-2">
      <span className="min-w-0 flex-1 truncate text-[12.5px] text-mid">{label}</span>
      <span className="flex shrink-0 items-center gap-1">
        <input
          inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}
          className="w-[96px] rounded-md border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2 py-1 text-right font-mono text-[12.5px] tabular-nums outline-none focus:border-[var(--accent)]"
        />
        {suffix && <span className="w-[22px] text-[11.5px] text-lo">{suffix}</span>}
      </span>
    </label>
  );
}

function Stat({ value, caption, tone }: { value: string; caption: string; tone?: "good" | "bad" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "good" ? "border-emerald-500/30 bg-emerald-500/10" : tone === "bad" ? "border-amber-500/30 bg-amber-500/10" : "border-[var(--glass-stroke)] bg-[var(--fill-1)]"}`}>
      <p className="font-mono text-[21px] leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-mid">{caption}</p>
    </div>
  );
}

export default function DebtEscapeApp() {
  const [income, setIncome] = useState("120000");
  const [essentials, setEssentials] = useState("40000");
  const [savings, setSavings] = useState("200000");
  const [taxRate, setTaxRate] = useState("30");
  const [surplus, setSurplus] = useState("15000");
  const [drop, setDrop] = useState("30");
  const [debts, setDebts] = useState<Debt[]>(SEED);

  const profile: Profile = useMemo(() => ({
    monthlyIncome: Number(income) || 0,
    essentialExpenses: Number(essentials) || 0,
    otherExpenses: 0,
    savings: Number(savings) || 0,
    taxRate: Number(taxRate) || 0,
    debts,
  }), [income, essentials, savings, taxRate, debts]);

  const extra = Number(surplus) || 0;
  const cmp = useMemo(() => compareStrategies(profile, extra), [profile, extra]);
  const stress = useMemo(() => stressTest(profile, extra, Number(drop) || 0), [profile, extra, drop]);
  const buffer = useMemo(() => bufferCheck(profile, 0, 6), [profile]);

  const committed = profile.essentialExpenses + debts.reduce((s, d) => s + dueThisMonth(d), 0) + extra;
  const free = profile.monthlyIncome - committed;

  const ranked = useMemo(
    () => [...debts].map((d) => ({ d, eff: effectiveRate(d, profile.taxRate) })).sort((a, b) => b.eff - a.eff),
    [debts, profile.taxRate]
  );

  const traps = useMemo(
    () => debts.filter((d) => d.kind === "card").map((d) => ({ d, t: minimumOnly(d) })),
    [debts]
  );

  const missing: string[] = [];
  if (!Number(income)) missing.push("monthly income");
  if (!Number(essentials)) missing.push("essential expenses");
  if (!Number(savings)) missing.push("savings");
  if (!debts.length) missing.push("at least one debt");

  const update = (id: string, patch: Partial<Debt>) =>
    setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));

  return (
    <div className="@container h-full">
      <div className="flex h-full flex-col @[760px]:flex-row">
        {/* inputs */}
        <div className="mac-scroll shrink-0 overflow-y-auto border-b border-[var(--glass-stroke)] p-4 @[760px]:w-[320px] @[760px]:border-b-0 @[760px]:border-r"
          style={{ background: "var(--win-sidebar)" }}>
          <h2 className="mb-2.5 text-[13px] font-semibold">Your situation</h2>
          <div className="space-y-1.5">
            <Num label="Monthly income" value={income} onChange={setIncome} suffix="₹" />
            <Num label="Essential expenses" value={essentials} onChange={setEssentials} suffix="₹" />
            <Num label="Savings" value={savings} onChange={setSavings} suffix="₹" />
            <Num label="Tax slab" value={taxRate} onChange={setTaxRate} suffix="%" />
            <Num label="Extra each month" value={surplus} onChange={setSurplus} suffix="₹" />
          </div>

          <div className="mb-2 mt-5 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Debts</h2>
            <button
              onClick={() => setDebts((ds) => [...ds, { id: `d${Date.now()}`, name: "New debt", balance: 100000, annualRate: 12, payment: 5000, kind: "other" }])}
              className="rounded-md bg-[var(--fill-2)] px-2 py-1 text-[11.5px] text-mid transition-colors hover:bg-[var(--fill-3)]"
            >
              Add
            </button>
          </div>

          <div className="space-y-2.5">
            {debts.map((d) => (
              <div key={d.id} className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <input
                    value={d.name} onChange={(e) => update(d.id, { name: e.target.value })} aria-label="Debt name"
                    className="min-w-0 flex-1 bg-transparent text-[12.5px] font-medium outline-none"
                  />
                  <button onClick={() => setDebts((ds) => ds.filter((x) => x.id !== d.id))} aria-label={`Remove ${d.name}`}
                    className="shrink-0 rounded px-1.5 text-[13px] text-lo hover:text-red-400">×</button>
                </div>
                <select
                  value={d.kind} onChange={(e) => update(d.id, { kind: e.target.value as DebtKind, minPercent: e.target.value === "card" ? 5 : undefined })}
                  aria-label="Debt type"
                  className="mb-1.5 w-full rounded-md border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-1.5 py-1 text-[11.5px] outline-none"
                >
                  {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
                </select>
                <Num label="Balance" value={String(d.balance)} onChange={(v) => update(d.id, { balance: Number(v) || 0 })} />
                <Num label="Rate" value={String(d.annualRate)} onChange={(v) => update(d.id, { annualRate: Number(v) || 0 })} suffix="%" />
                <Num label={d.kind === "card" ? "Min payment" : "EMI"} value={String(d.payment)} onChange={(v) => update(d.id, { payment: Number(v) || 0 })} />
              </div>
            ))}
          </div>
        </div>

        {/* results */}
        <div className="mac-scroll min-h-0 flex-1 overflow-y-auto p-4 @[760px]:p-5">
          {missing.length > 0 && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-[12.5px] text-amber-300">
                Still needed before this means anything: {missing.join(", ")}.
              </p>
            </div>
          )}

          {cmp.avalanche.neverClears ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-[14px] font-semibold text-red-300">These payments never clear the debt</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mid">
                At these rates the interest keeps pace with what is being paid. The repayments have
                to rise, or the rates have to come down, before any payoff date exists.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-2 @[560px]:grid-cols-3">
                <Stat value={term(cmp.avalanche.months)} caption="debt-free in" tone="good" />
                <Stat value={money(cmp.avalanche.totalInterest)} caption="total interest" />
                <Stat value={free >= 0 ? money(free) : money(free)} caption="left over each month" tone={free < 0 ? "bad" : undefined} />
              </div>

              {/* strategy */}
              <section className="mt-4">
                <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">Which debt first</h3>
                <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  {cmp.sameTargeting ? (
                    <p className="text-[13px] text-mid">
                      Both strategies attack the same debt first, so there is nothing to choose
                      between them here.
                    </p>
                  ) : (
                    <p className="text-[13px] leading-relaxed text-mid">
                      Highest-rate-first saves <strong className="text-emerald-400">{money(cmp.interestSaved)}</strong>
                      {cmp.monthsSaved > 0 && <> and finishes {cmp.monthsSaved} month{cmp.monthsSaved === 1 ? "" : "s"} sooner</>}
                      {" "}than smallest-balance-first. Smallest-first clears a debt quicker, which some
                      people need to keep going — that is a real reason, just not a mathematical one.
                    </p>
                  )}

                  <ol className="mt-3 space-y-1.5">
                    {ranked.map(({ d, eff }, i) => (
                      <li key={d.id} className="flex flex-wrap items-baseline justify-between gap-x-3 text-[12.5px]">
                        <span className="text-mid">
                          <span className="font-mono text-lo">{i + 1}.</span> {d.name}
                        </span>
                        <span className="font-mono tabular-nums">
                          {d.annualRate.toFixed(1)}%
                          {Math.abs(eff - d.annualRate) > 0.05 && (
                            <span className="text-emerald-400"> → {eff.toFixed(1)}% after tax</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {ranked.some(({ d, eff }) => Math.abs(eff - d.annualRate) > 0.05) && (
                    <p className="mt-2 text-[11.5px] leading-relaxed text-lo">
                      Ordered by cost after tax relief, not by headline rate — a deductible loan can
                      be cheaper than one with a lower number on it.
                    </p>
                  )}
                </div>
              </section>

              {/* payoff order */}
              <section className="mt-4">
                <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">Payoff order</h3>
                <div className="space-y-1.5">
                  {cmp.avalanche.order.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-baseline justify-between gap-x-3 rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-3 py-2 text-[12.5px]">
                      <span>{o.name}</span>
                      <span className="font-mono tabular-nums text-mid">
                        month {o.month} · {money(o.interestPaid)} interest
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* cards */}
          {traps.map(({ d, t }) => (
            <section key={d.id} className="mt-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-[13px] font-semibold text-red-300">{d.name}: the minimum-payment trap</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-mid">
                  {t.neverClears ? (
                    <>Paying only the minimum never clears this — the payment does not cover the interest.</>
                  ) : (
                    <>
                      Paying only the minimum takes <strong>{term(t.months)}</strong> and costs{" "}
                      <strong>{money(t.interest)}</strong> in interest on a {money(d.balance)} balance.
                    </>
                  )}
                </p>
              </div>
            </section>
          ))}

          {/* stress */}
          <section className="mt-4">
            <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">If income drops</h3>
            <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
              <div className="mb-2 flex items-center gap-3">
                <input
                  type="range" min={0} max={80} step={5} value={drop} onChange={(e) => setDrop(e.target.value)}
                  aria-label="Income drop" className="flex-1 accent-[var(--accent)]"
                />
                <span className="w-[52px] shrink-0 text-right font-mono text-[12.5px] tabular-nums">−{drop}%</span>
              </div>
              {stress.survives ? (
                <p className="text-[12.5px] text-emerald-400">
                  Still covered at {money(stress.newIncome)} a month — commitments are {money(stress.committed)}.
                </p>
              ) : (
                <p className="text-[12.5px] leading-relaxed text-amber-400">
                  Short {money(stress.shortfall)} a month. Savings would cover the gap for{" "}
                  <strong>{stress.monthsCovered?.toFixed(1)} months</strong> before something has to give.
                </p>
              )}
            </div>
          </section>

          {/* buffer */}
          <section className="mt-4">
            <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">Emergency buffer</h3>
            <div className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
              <p className="text-[12.5px] leading-relaxed text-mid">
                Savings cover <strong className={buffer.alreadyShort ? "text-amber-400" : "text-emerald-400"}>
                  {buffer.monthsHeld.toFixed(1)} months</strong> of essentials and repayments.
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-mid">
                {buffer.alreadyShort ? (
                  <>Below a six-month buffer, so there is no spare cash to throw at the debt yet.
                  Clearing debt faster is worth less than not borrowing again at card rates when
                  something breaks.</>
                ) : (
                  <>Up to <strong>{money(buffer.maxSafePrepay)}</strong> could go towards the debt
                  while keeping six months in reserve.</>
                )}
              </p>
            </div>
          </section>

          <p className="mt-5 text-[11.5px] leading-relaxed text-lo">
            Illustrative projections from the figures entered, not financial advice. Tax relief is
            modelled on Section 24(b) and 80E as they generally apply; your own position may differ.
          </p>
        </div>
      </div>
    </div>
  );
}
