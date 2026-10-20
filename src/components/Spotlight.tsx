"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { APPS } from "@/lib/apps";
import { projects, profile } from "@/content/profile";
import { WALLPAPERS, useSystem, useWindows } from "@/lib/store";
import { Glyph } from "@/components/Icons";
import { calculate } from "@/lib/calc";

/** Impure by design — defined outside the component so render stays pure. */
function shuffleWallpaper() {
  const ids = WALLPAPERS.map((w) => w.id);
  useSystem.getState().setWallpaper(ids[Math.floor(Math.random() * ids.length)]);
}

type Result = {
  id: string;
  title: string;
  subtitle: string;
  kind: string;
  icon: React.ReactNode;
  run: () => void;
  haystack: string;
};

export default function Spotlight() {
  const open = useSystem((s) => s.spotlight);
  const setOpen = useSystem((s) => s.setSpotlight);
  const setAppearance = useSystem((s) => s.setAppearance);
  const openApp = useWindows((s) => s.open);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo<Result[]>(() => {
    const out: Result[] = [];

    for (const a of APPS) {
      out.push({
        id: `app-${a.id}`,
        title: a.name,
        subtitle: a.href ? "External link" : "Application",
        kind: "Applications",
        icon: <span className="h-8 w-8">{a.icon}</span>,
        haystack: [a.name, ...a.keywords].join(" ").toLowerCase(),
        run: () => (a.href ? window.open(a.href, "_blank", "noopener,noreferrer") : openApp(a.id, { size: a.size })),
      });
    }

    for (const p of projects) {
      out.push({
        id: `proj-${p.id}`,
        title: p.name,
        subtitle: p.blurb,
        kind: "Projects",
        icon: <span className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${p.accent} text-[16px]`}>{p.emoji}</span>,
        haystack: [p.name, p.blurb, ...p.tags].join(" ").toLowerCase(),
        run: () => openApp("projects", { size: { w: 900, h: 610 }, payload: { projectId: p.id, key: `project-${p.id}` }, singletonKey: `project-${p.id}` }),
      });
    }

    for (const s of profile.socials) {
      out.push({
        id: `social-${s.label}`,
        title: s.label,
        subtitle: s.handle,
        kind: "Links",
        icon: <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/12 text-[13px]">↗</span>,
        haystack: `${s.label} ${s.handle} ${s.url}`.toLowerCase(),
        run: () => window.open(s.url, "_blank", "noopener,noreferrer"),
      });
    }

    out.push(
      {
        id: "act-dark",
        title: "Switch to Dark",
        subtitle: "Appearance",
        kind: "Actions",
        icon: <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/12">🌙</span>,
        haystack: "dark mode appearance theme night",
        run: () => setAppearance("dark"),
      },
      {
        id: "act-light",
        title: "Switch to Light",
        subtitle: "Appearance",
        kind: "Actions",
        icon: <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/12">☀️</span>,
        haystack: "light mode appearance theme day",
        run: () => setAppearance("light"),
      },
      {
        id: "act-wall",
        title: "Shuffle Wallpaper",
        subtitle: "Desktop",
        kind: "Actions",
        icon: <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/12">🖼️</span>,
        haystack: "wallpaper background desktop shuffle random",
        run: shuffleWallpaper,
      },
      {
        id: "act-copy",
        title: "Copy Email Address",
        subtitle: profile.email,
        kind: "Actions",
        icon: <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/12">📋</span>,
        haystack: `copy email address contact ${profile.email}`,
        run: () => navigator.clipboard?.writeText(profile.email),
      }
    );

    if (!q.trim()) return out.slice(0, 7);
    const needle = q.toLowerCase().trim();
    return out
      .map((r) => {
        const i = r.haystack.indexOf(needle);
        const starts = r.title.toLowerCase().startsWith(needle);
        return { r, score: i < 0 ? -1 : (starts ? 1000 : 0) + (100 - i) };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9)
      .map((x) => x.r);
  }, [q, openApp, setAppearance]);

  /* ⌘K / ⌘Space to open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!useSystem.getState().spotlight);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;
    // reset + focus on the next tick so the panel is mounted and we never
    // set state synchronously inside the effect body
    const t = setTimeout(() => {
      setQ("");
      setIdx(0);
      inputRef.current?.focus();
    }, 40);
    return () => clearTimeout(t);
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => (i + 1) % Math.max(1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => (i - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[idx]?.run();
      setOpen(false);
    }
  }

  const calc = useMemo(() => calculate(q), [q]);

  const grouped = results.reduce<Record<string, Result[]>>((acc, r) => {
    (acc[r.kind] ||= []).push(r);
    return acc;
  }, {});
  let flat = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={() => setOpen(false)}
          className="fixed inset-0 z-[9500] flex items-start justify-center bg-black/25 px-4 pt-[16vh] backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.96, y: -12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-white/16 shadow-2xl"
            style={{ background: "rgba(38,40,48,.82)", backdropFilter: "blur(44px) saturate(180%)", WebkitBackdropFilter: "blur(44px) saturate(180%)" }}
          >
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-white/55">{Glyph.search}</span>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIdx(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Spotlight Search"
                aria-label="Spotlight Search"
                className="w-full bg-transparent text-[20px] text-white outline-none placeholder:text-white/35"
              />
              <kbd className="hidden rounded border border-white/18 px-1.5 py-0.5 font-mono text-[10.5px] text-white/50 sm:block">esc</kbd>
            </div>

            {calc && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(calc.value.replace(/[₹,]/g, "").replace(" / month", ""));
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-3 text-left transition-colors hover:bg-white/6"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/22 text-[15px] text-[var(--accent)]">
                  =
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[20px] font-medium tabular-nums text-white">{calc.value}</span>
                  <span className="block truncate text-[12px] text-white/45">{calc.reading}</span>
                </span>
                <span className="shrink-0 rounded border border-white/18 px-1.5 py-0.5 font-mono text-[10px] text-white/45">
                  copy
                </span>
              </button>
            )}

            {results.length > 0 && (
              <div className="mac-scroll max-h-[46vh] overflow-y-auto border-t border-white/10 p-1.5">
                {Object.entries(grouped).map(([kind, rows]) => (
                  <div key={kind}>
                    <p className="px-2.5 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/35">{kind}</p>
                    {rows.map((r) => {
                      flat += 1;
                      const here = flat;
                      return (
                        <button
                          key={r.id}
                          onMouseEnter={() => setIdx(here)}
                          onClick={() => {
                            r.run();
                            setOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                            idx === here ? "bg-[var(--accent)]" : "hover:bg-white/8"
                          }`}
                        >
                          {r.icon}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14px] text-white">{r.title}</span>
                            <span className={`block truncate text-[12px] ${idx === here ? "text-white/75" : "text-white/45"}`}>{r.subtitle}</span>
                          </span>
                          {idx === here && <kbd className="shrink-0 font-mono text-[11px] text-white/70">⏎</kbd>}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {q.trim() && results.length === 0 && !calc && (
              <p className="border-t border-white/10 px-4 py-7 text-center text-[13.5px] text-white/45">
                No results for “{q}”
              </p>
            )}

            {!q.trim() && (
              <p className="border-t border-white/10 px-4 py-2.5 text-center font-mono text-[11px] text-white/30">
                also does maths — try 2500*1.12 · 15% of 48000 · cagr 100 250 5 · emi 500000 9 20 · sip 5000 12 10
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
