"use client";

import { useMemo, useState } from "react";
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

  const ratios = useMemo(() => computeRatios(figures), [figures]);
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
    <div className="@container h-full">
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
