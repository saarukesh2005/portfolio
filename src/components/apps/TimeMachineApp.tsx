"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { profile, timeline, certifications, type Milestone } from "@/content/profile";
import { useWindows } from "@/lib/store";

const KIND_TINT: Record<Milestone["kind"], string> = {
  education: "from-sky-500/80 to-sky-700/60",
  certification: "from-violet-500/80 to-violet-700/60",
  work: "from-emerald-500/80 to-emerald-700/60",
  project: "from-amber-500/80 to-amber-700/60",
};

/** Deterministic PRNG so the starfield is identical on every render. */
function stars(count: number) {
  let seed = 20260620;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    r: rand() * 1.5 + 0.3,
    o: rand() * 0.7 + 0.15,
  }));
}

export default function TimeMachineApp() {
  const ordered = useMemo(() => [...timeline].sort((a, b) => a.at.localeCompare(b.at)), []);
  const field = useMemo(() => stars(130), []);
  const [index, setIndex] = useState(ordered.length - 1);
  const openApp = useWindows((s) => s.open);

  const current = ordered[index];

  /** Everything true as of the selected point — the "state of the disk". */
  const snapshot = useMemo(() => {
    const upto = ordered.slice(0, index + 1);
    const done = certifications.filter((c) => {
      const m = ordered.find((o) => o.title.includes(c.name.split(" —")[0]));
      return m && m.at <= current.at && c.status === "Completed";
    });
    return {
      milestones: upto.length,
      certs: done.length,
      latest: upto[upto.length - 1],
    };
  }, [index, ordered, current]);

  return (
    <div className="relative h-full overflow-hidden bg-[#03060f]">
      {/* starfield */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="tm-glow" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#1b3c7a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#03060f" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#tm-glow)" />
        {field.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.12} fill="#fff" opacity={s.o} />
        ))}
      </svg>

      {/* receding stack */}
      <div
        className="absolute inset-0 flex items-end justify-center px-4 pb-28 pt-10"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 42%" }}
      >
        <div className="relative h-[300px] w-full max-w-[520px]" style={{ transformStyle: "preserve-3d" }}>
          {ordered.map((m, i) => {
            const depth = index - i; // 0 = front, positive = further back in time
            if (depth < 0 || depth > 5) return null;
            return (
              <motion.div
                key={m.at + m.title}
                initial={false}
                animate={{
                  // the Y offset has to outrun the perspective shrink, or each
                  // card recedes *inside* the one in front and the stack vanishes
                  z: -depth * 150,
                  y: -depth * 46,
                  opacity: depth === 0 ? 1 : Math.max(0.12, 0.62 - depth * 0.12),
                  filter: depth === 0 ? "blur(0px)" : `blur(${depth * 0.8}px)`,
                }}
                transition={{ type: "spring", stiffness: 260, damping: 32 }}
                className="absolute inset-x-0 top-0 overflow-hidden rounded-2xl border border-white/15"
                style={{
                  background: "rgba(14,18,30,.9)",
                  boxShadow: "0 30px 80px rgba(0,0,0,.7)",
                  zIndex: 100 - depth,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className={`h-[5px] w-full bg-gradient-to-r ${KIND_TINT[m.kind]}`} />
                <div className="p-5">
                  <p className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-white/40">{m.label}</p>
                  <h2 className="mt-1.5 text-[19px] font-semibold leading-snug text-white">{m.title}</h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/60">{m.detail}</p>

                  {depth === 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3.5">
                      <Stat label="Milestones" value={String(snapshot.milestones)} />
                      <Stat label="Certifications" value={String(snapshot.certs)} />
                      <Stat label="Kind" value={m.kind} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* scrubber */}
      <div className="absolute inset-y-0 right-0 z-20 flex w-[86px] flex-col items-stretch justify-center gap-0.5 pr-2">
        {ordered.map((m, i) => (
          <button
            key={m.at}
            onClick={() => setIndex(i)}
            className="group flex items-center justify-end gap-2 py-1"
            aria-label={`${m.label} — ${m.title}`}
          >
            <span
              className={`truncate font-mono text-[10.5px] transition-colors ${
                i === index ? "text-white" : "text-white/35 group-hover:text-white/70"
              }`}
            >
              {m.at.slice(0, 4)}
            </span>
            <span
              className={`h-px transition-all ${
                i === index ? "w-7 bg-white" : "w-3.5 bg-white/30 group-hover:w-5 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-3 pb-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.at}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="font-mono text-[12px] tracking-wide text-white/55"
          >
            {profile.name} · {current.label}
          </motion.p>
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-[12.5px] text-white/80 transition-colors hover:bg-white/16 disabled:opacity-30"
          >
            ← Earlier
          </button>
          <button
            onClick={() => {
              if (current.kind === "project") openApp("projects", { size: { w: 900, h: 610 } });
              else if (current.kind === "certification") openApp("about", { size: { w: 840, h: 560 } });
              else openApp("resume", { size: { w: 780, h: 640 } });
            }}
            className="rounded-lg bg-white px-4 py-1.5 text-[12.5px] font-medium text-[#0b1020] transition-opacity hover:opacity-88"
          >
            Restore
          </button>
          <button
            onClick={() => setIndex((i) => Math.min(ordered.length - 1, i + 1))}
            disabled={index === ordered.length - 1}
            className="rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-[12.5px] text-white/80 transition-colors hover:bg-white/16 disabled:opacity-30"
          >
            Later →
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-white/12 bg-white/6 px-2.5 py-1.5">
      <span className="block font-mono text-[9.5px] uppercase tracking-wider text-white/40">{label}</span>
      <span className="block text-[12.5px] capitalize text-white/85">{value}</span>
    </span>
  );
}
