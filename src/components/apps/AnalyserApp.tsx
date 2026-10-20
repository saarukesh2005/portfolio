"use client";

import { useMemo, useState } from "react";
import DocumentImport from "@/components/apps/DocumentImport";
import { altmanZ, cashCycle, dupont } from "@/lib/finance";
import {
  EMPTY_FIGURES,
  FIELDS,
  SAMPLE,
  computeRatios,
  type Figures,
  type Ratio,
  type Verdict,
} from "@/lib/ratios";

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  strong: { label: "Strong", cls: "bg-emerald-500/18 text-emerald-400" },
  fair: { label: "Fair", cls: "bg-amber-500/18 text-amber-400" },
  weak: { label: "Weak", cls: "bg-red-500/18 text-red-400" },
  none: { label: "—", cls: "bg-[var(--fill-2)] text-lo" },
};

const GROUPS: Ratio["group"][] = ["Profitability", "Liquidity", "Efficiency", "Leverage"];

function format(value: number | null, unit: Ratio["unit"]) {
  if (value === null) return "—";
  const dp = unit === "×" ? 2 : unit === "days" ? 0 : 1;
  return value.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export default function AnalyserApp() {
  const [figures, setFigures] = useState<Figures>(SAMPLE);
  const [sampleLoaded, setSampleLoaded] = useState(true);
  const [importing, setImporting] = useState(false);

  const ratios = useMemo(() => computeRatios(figures), [figures]);
  const dp = useMemo(() => dupont(figures), [figures]);
  const z = useMemo(() => altmanZ(figures), [figures]);
  const cc = useMemo(() => cashCycle(figures), [figures]);
  const computed = ratios.filter((r) => r.value !== null).length;

  const set = (key: keyof Figures, raw: string) => {
    setSampleLoaded(false);
    const trimmed = raw.trim();
    const n = trimmed === "" ? null : Number(trimmed.replace(/,/g, ""));
    setFigures((f) => ({ ...f, [key]: n !== null && Number.isFinite(n) ? n : null }));
  };

  const groupsOf = (g: string) => FIELDS.filter((f) => f.group === g);

  return (
    /*
     * Container queries, not viewport ones: a window's width has nothing to do
     * with the screen's, so a narrow window on a big monitor must still get the
     * stacked layout. The container and the element that queries it have to be
     * different elements — nothing can query its own container.
     */
    <div className="@container relative h-full">
      {importing && (
        <DocumentImport
          onClose={() => setImporting(false)}
          onApply={(found) => {
            setSampleLoaded(false);
            setFigures((f) => ({ ...f, ...found }));
          }}
        />
      )}
      <div className="flex h-full flex-col @[680px]:flex-row">
      {/* ── inputs ─────────────────────────────────────────────── */}
      <div
        className="mac-scroll shrink-0 overflow-y-auto border-b border-[var(--glass-stroke)] p-4 @[680px]:w-[296px] @[680px]:border-b-0 @[680px]:border-r"
        style={{ background: "var(--win-sidebar)" }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-[13px] font-semibold">Figures</h2>
          <div className="flex gap-1.5">
            <button
              onClick={() => setImporting(true)}
              className="rounded-md bg-[var(--accent)] px-2 py-1 text-[11.5px] font-medium text-white transition-opacity hover:opacity-88"
            >
              Import
            </button>
            <button
              onClick={() => {
                setFigures(SAMPLE);
                setSampleLoaded(true);
              }}
              className="rounded-md bg-[var(--fill-2)] px-2 py-1 text-[11.5px] text-mid transition-colors hover:bg-[var(--fill-3)]"
            >
              Sample
            </button>
            <button
              onClick={() => {
                setFigures(EMPTY_FIGURES);
                setSampleLoaded(false);
              }}
              className="rounded-md bg-[var(--fill-2)] px-2 py-1 text-[11.5px] text-mid transition-colors hover:bg-[var(--fill-3)]"
            >
              Clear
            </button>
          </div>
        </div>

        <p className="mb-4 text-[11.5px] leading-relaxed text-lo">
          Any consistent unit — ₹ Cr, ₹ lakh, millions. Every ratio below is unit-free, so it
          cancels out.
        </p>

        {(["Income statement", "Balance sheet"] as const).map((g) => (
          <section key={g} className="mb-4 last:mb-0">
            <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">{g}</h3>
            <div className="space-y-1.5">
              {groupsOf(g).map((f) => (
                <label key={f.key} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-mid">{f.label}</span>
                  <input
                    inputMode="decimal"
                    value={figures[f.key] ?? ""}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder="—"
                    aria-label={f.label}
                    className="w-[88px] shrink-0 rounded-md border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2 py-1 text-right font-mono text-[12.5px] tabular-nums outline-none focus:border-[var(--accent)]"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ── results ────────────────────────────────────────────── */}
      <div className="mac-scroll min-h-0 flex-1 overflow-y-auto p-4 @[680px]:p-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[16px] font-semibold tracking-[-0.01em]">Ratio Analysis</h2>
          <span className="font-mono text-[11.5px] text-lo">
            {computed} of {ratios.length} computed
          </span>
        </div>

        {sampleLoaded && (
          <p className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[12px] leading-relaxed text-amber-300/90">
            Showing illustrative figures for a made-up manufacturer, so there is something to look
            at. These are not any real company&rsquo;s accounts — type over them.
          </p>
        )}

        <div className="space-y-5">
          {GROUPS.map((g) => {
            const rows = ratios.filter((r) => r.group === g);
            return (
              <section key={g}>
                <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">{g}</h3>
                <div className="space-y-2">
                  {rows.map((r) => (
                    <article
                      key={r.name}
                      className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h4 className="text-[13.5px] font-semibold">{r.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[15px] tabular-nums">
                            {format(r.value, r.unit)}
                            {r.value !== null && (
                              <span className="ml-0.5 text-[11px] text-lo">
                                {r.unit === "days" ? " days" : r.unit}
                              </span>
                            )}
                          </span>
                          <span className={`rounded-md px-1.5 py-[2px] text-[10.5px] ${VERDICT[r.verdict].cls}`}>
                            {VERDICT[r.verdict].label}
                          </span>
                        </div>
                      </div>

                      <p className="mt-0.5 font-mono text-[11px] text-lo">{r.formula}</p>
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-mid">{r.reading}</p>

                      {r.needs.length > 0 && (
                        <p className="mt-1.5 text-[11.5px] text-lo">Needs: {r.needs.join(", ")}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {(dp || z || cc) && (
          <section className="mt-6">
            <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-lo">
              Diagnostics
            </h3>
            <div className="space-y-2">
              {dp && (
                <article className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h4 className="text-[13.5px] font-semibold">DuPont decomposition</h4>
                    <span className="font-mono text-[15px] tabular-nums">
                      ROE {dp.roe.toFixed(1)}<span className="ml-0.5 text-[11px] text-lo">%</span>
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-lo">
                    tax burden × interest burden × operating margin × asset turnover × equity multiplier
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[
                      ["Tax burden", dp.taxBurden],
                      ["Interest burden", dp.interestBurden],
                      ["Operating margin", dp.operatingMargin],
                      ["Asset turnover", dp.assetTurnover],
                      ["Equity multiplier", dp.equityMultiplier],
                    ].map(([k, v]) => (
                      <span key={k as string} className="rounded-lg bg-[var(--fill-2)] px-2 py-1 text-[11.5px]">
                        <span className="text-lo">{k as string} </span>
                        <span className="font-mono tabular-nums">{(v as number).toFixed(3)}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-mid">
                    Splits ROE into the five levers behind it, so a high return traceable to leverage
                    reads differently from one earned on margin.
                  </p>
                </article>
              )}

              {z && (
                <article className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h4 className="text-[13.5px] font-semibold">Altman Z&prime;-score</h4>
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-[15px] tabular-nums">{z.z.toFixed(2)}</span>
                      <span
                        className={`rounded-md px-1.5 py-[2px] text-[10.5px] ${
                          z.zone === "Safe"
                            ? "bg-emerald-500/18 text-emerald-400"
                            : z.zone === "Grey"
                              ? "bg-amber-500/18 text-amber-400"
                              : "bg-red-500/18 text-red-400"
                        }`}
                      >
                        {z.zone}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {z.parts.map((p) => (
                      <span key={p.k} className="rounded-lg bg-[var(--fill-2)] px-2 py-1 text-[11.5px]">
                        <span className="text-lo">{p.k} </span>
                        <span className="font-mono tabular-nums">{p.v.toFixed(3)}</span>
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-mid">
                    The private-company revision, which uses book equity rather than market
                    capitalisation. Safe above 2.9, distress below 1.23.
                  </p>
                </article>
              )}

              {cc && (
                <article className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h4 className="text-[13.5px] font-semibold">Cash conversion cycle</h4>
                    <span className="font-mono text-[15px] tabular-nums">
                      {cc.ccc.toFixed(0)}<span className="ml-0.5 text-[11px] text-lo"> days</span>
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-lo">
                    DIO {cc.dio.toFixed(0)} + DSO {cc.dso.toFixed(0)} − DPO {cc.dpo.toFixed(0)}
                  </p>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-mid">
                    Days between paying for stock and collecting on the sale. Negative means
                    suppliers fund the working capital.
                  </p>
                </article>
              )}
            </div>
          </section>
        )}

        <p className="mt-5 text-[11.5px] leading-relaxed text-lo">
          Strong / Fair / Weak are broad general-purpose bands. They are not industry-adjusted — a
          capital-heavy PSU and an FMCG business should never be read against the same yardstick, so
          treat these as a starting point rather than a verdict.
        </p>
        </div>
      </div>
    </div>
  );
}
