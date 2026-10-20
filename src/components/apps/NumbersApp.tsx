"use client";

import { useState } from "react";
import { financials, type FinancialRow } from "@/content/financials";

export default function NumbersApp() {
  const [charted, setCharted] = useState<string | null>(null);

  if (!financials) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div className="max-w-[46ch]">
          <span className="mb-3 block text-[34px]">📊</span>
          <h2 className="mb-2 text-[16px] font-semibold">No figures loaded</h2>
          <p className="text-[13px] leading-relaxed text-mid">
            You computed five years of profitability, efficiency and liquidity ratios for Bharat
            Dynamics. Those numbers are far more convincing than the paragraph describing them —
            this window puts them on screen as a spreadsheet with trend charts.
          </p>
          <p className="mt-4 text-[12.5px] leading-relaxed text-lo">
            Open <code className="font-mono text-[12px]">src/content/financials.ts</code>. The ratio
            rows are already laid out; you mostly just type the numbers.
          </p>
        </div>
      </div>
    );
  }

  const { company, ticker, source, years, rows } = financials;
  const groups = [...new Set(rows.map((r) => r.group))];
  const active = rows.find((r) => r.label === charted) ?? null;

  return (
    <div className="flex h-full flex-col">
      <div
        className="shrink-0 border-b border-[var(--glass-stroke)] px-4 py-2.5"
        style={{ background: "var(--win-chrome)" }}
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h2 className="text-[14px] font-semibold">{company}</h2>
          {ticker && <span className="font-mono text-[11.5px] text-lo">{ticker}</span>}
        </div>
        <p className="text-[11.5px] text-lo">{source}</p>
      </div>

      <div className="mac-scroll flex-1 overflow-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr style={{ background: "var(--win-chrome)" }}>
              <th className="sticky left-0 z-20 min-w-[190px] border-b border-r border-[var(--glass-stroke)] px-3 py-2 text-left font-semibold"
                style={{ background: "var(--win-chrome)" }}>
                Metric
              </th>
              {years.map((y) => (
                <th key={y} className="border-b border-r border-[var(--glass-stroke)] px-3 py-2 text-right font-mono font-semibold">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <GroupRows
                key={g}
                group={g}
                rows={rows.filter((r) => r.group === g)}
                yearCount={years.length}
                charted={charted}
                onChart={setCharted}
              />
            ))}
          </tbody>
        </table>

        {active && <Trend row={active} years={years} />}
      </div>
    </div>
  );
}

function GroupRows({
  group,
  rows,
  yearCount,
  charted,
  onChart,
}: {
  group: string;
  rows: FinancialRow[];
  yearCount: number;
  charted: string | null;
  onChart: (label: string | null) => void;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={yearCount + 1}
          className="border-b border-[var(--glass-stroke)] bg-[var(--fill-1)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-lo"
        >
          {group}
        </td>
      </tr>
      {rows.map((r, i) => (
        <tr
          key={r.label}
          onClick={() => onChart(charted === r.label ? null : r.label)}
          className={`cursor-pointer transition-colors hover:bg-[var(--fill-2)] ${
            charted === r.label ? "bg-[var(--accent)]/15" : i % 2 ? "bg-[var(--fill-1)]" : ""
          }`}
        >
          <td className="sticky left-0 border-b border-r border-[var(--glass-stroke)] px-3 py-1.5"
            style={{ background: "inherit" }}>
            {r.label}
            {r.unit && <span className="ml-1 text-[11px] text-lo">({r.unit})</span>}
          </td>
          {r.values.map((v, j) => (
            <td key={j} className="border-b border-r border-[var(--glass-stroke)] px-3 py-1.5 text-right font-mono tabular-nums">
              {v === null || v === undefined ? <span className="text-lo">—</span> : v.toLocaleString("en-IN")}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Minimal inline chart — no library, so nothing to keep up to date. */
function Trend({ row, years }: { row: FinancialRow; years: string[] }) {
  const vals = row.values.map((v) => (v === null ? NaN : v));
  const clean = vals.filter((v) => !Number.isNaN(v));
  if (clean.length < 2) return null;

  const W = 560;
  const H = 150;
  const PAD = { l: 46, r: 14, t: 14, b: 26 };
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = max - min || 1;

  const x = (i: number) => PAD.l + (i * (W - PAD.l - PAD.r)) / Math.max(1, vals.length - 1);
  const y = (v: number) => PAD.t + (1 - (v - min) / span) * (H - PAD.t - PAD.b);

  const pts = vals.map((v, i) => (Number.isNaN(v) ? null : [x(i), y(v)] as const)).filter(Boolean) as (readonly [number, number])[];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)} ${H - PAD.b} L${pts[0][0].toFixed(1)} ${H - PAD.b} Z`;

  return (
    <div className="border-t border-[var(--glass-stroke)] p-4">
      <p className="mb-2 text-[12.5px] font-semibold">
        {row.label} {row.unit && <span className="text-lo">({row.unit})</span>}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 190 }}>
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + t * (H - PAD.t - PAD.b)} y2={PAD.t + t * (H - PAD.t - PAD.b)}
              stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
            <text x={PAD.l - 7} y={PAD.t + t * (H - PAD.t - PAD.b) + 3.5} textAnchor="end"
              className="fill-current text-[9px] opacity-45 font-mono">
              {(max - t * span).toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#trend-fill)" />
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill="var(--accent)" />)}
        {years.map((yr, i) => (
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" className="fill-current text-[9px] opacity-45 font-mono">
            {yr}
          </text>
        ))}
      </svg>
      <p className="mt-1 text-[11.5px] text-lo">Click any row to chart it.</p>
    </div>
  );
}
