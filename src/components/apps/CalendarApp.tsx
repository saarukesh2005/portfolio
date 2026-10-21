"use client";

import { useMemo, useState } from "react";
import { timeline, type Milestone } from "@/content/profile";

const KIND: Record<Milestone["kind"], { label: string; dot: string; tint: string }> = {
  education: { label: "Education", dot: "bg-sky-400", tint: "text-sky-400" },
  certification: { label: "Certification", dot: "bg-violet-400", tint: "text-violet-400" },
  work: { label: "Work", dot: "bg-emerald-400", tint: "text-emerald-400" },
  project: { label: "Project", dot: "bg-amber-400", tint: "text-amber-400" },
};

export default function CalendarApp() {
  const [filter, setFilter] = useState<Milestone["kind"] | "all">("all");

  const years = useMemo(() => {
    const rows = [...timeline].sort((a, b) => a.at.localeCompare(b.at));
    const shown = filter === "all" ? rows : rows.filter((r) => r.kind === filter);
    const grouped = new Map<string, Milestone[]>();
    for (const r of shown) {
      const y = r.at.slice(0, 4);
      grouped.set(y, [...(grouped.get(y) ?? []), r]);
    }
    return [...grouped.entries()];
  }, [filter]);

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-[var(--glass-stroke)] px-4 py-2.5"
        style={{ background: "var(--win-chrome)" }}
      >
        {(["all", ...Object.keys(KIND)] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k as Milestone["kind"] | "all")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] transition-colors ${
              filter === k ? "bg-[var(--accent)] text-white" : "bg-[var(--fill-2)] text-mid hover:bg-[var(--fill-3)]"
            }`}
          >
            {k !== "all" && <span className={`h-1.5 w-1.5 rounded-full ${KIND[k as Milestone["kind"]].dot}`} />}
            {k === "all" ? "All" : KIND[k as Milestone["kind"]].label}
          </button>
        ))}
      </div>

      <div className="@container mac-scroll flex-1 overflow-y-auto px-5 py-5 @[620px]:px-7">
        {years.map(([year, items]) => (
          <section key={year} className="mb-7 last:mb-0">
            <h2 className="mb-3 font-mono text-[12px] font-semibold tracking-wider text-lo">{year}</h2>
            <ol className="relative space-y-4 border-l border-[var(--glass-stroke)] pl-6">
              {items.map((m) => (
                <li key={m.at + m.title} className="relative">
                  <span
                    className={`absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--win-bg)] ${KIND[m.kind].dot}`}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="text-[14.5px] font-semibold">{m.title}</h3>
                    <span className="font-mono text-[11.5px] text-lo">{m.label}</span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-mid">{m.detail}</p>
                  {m.status && m.status !== "done" && (
                    <span
                      className={`mt-1.5 inline-block rounded-md px-2 py-[2px] text-[11.5px] ${
                        m.status === "active" ? "bg-sky-500/18 text-sky-400" : "bg-amber-500/18 text-amber-400"
                      }`}
                    >
                      {m.status === "active" ? "In progress" : "Result awaited"}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        ))}

        {years.length === 0 && <p className="py-12 text-center text-[13px] text-lo">Nothing in this category yet.</p>}
      </div>
    </div>
  );
}
