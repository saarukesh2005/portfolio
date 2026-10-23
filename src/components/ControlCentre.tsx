"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WALLPAPERS, useSystem, useWindows } from "@/lib/store";
import { NowPlayingCard } from "@/components/NowPlaying";

export default function ControlCentre() {
  const open = useSystem((s) => s.controlCentre);
  const setOpen = useSystem((s) => s.setControlCentre);
  const appearance = useSystem((s) => s.appearance);
  const setAppearance = useSystem((s) => s.setAppearance);
  const wallpaperId = useSystem((s) => s.wallpaperId);
  const setWallpaper = useSystem((s) => s.setWallpaper);
  const setLaunchpad = useSystem((s) => s.setLaunchpad);
  const setMissionControl = useSystem((s) => s.setMissionControl);
  const setShortcuts = useSystem((s) => s.setShortcuts);
  const openApp = useWindows((s) => s.open);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest("[data-control-centre-trigger]")) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.14 }}
          className="fixed right-2 top-[30px] z-[9350] w-[292px] rounded-2xl border border-white/14 p-3 shadow-2xl"
          style={{ background: "rgba(42,44,52,.86)", backdropFilter: "blur(38px) saturate(180%)" }}
        >
          <NowPlayingCard />

          <div className="mb-2.5 grid grid-cols-2 gap-2">
            {(["dark", "light"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setAppearance(m)}
                className={`rounded-xl border px-3 py-2.5 text-left text-[12.5px] capitalize transition-colors ${
                  appearance === m
                    ? "border-[var(--accent)] bg-[var(--accent)]/22 text-white"
                    : "border-white/10 bg-white/8 text-white/70 hover:bg-white/14"
                }`}
              >
                <span className="mb-1 block text-[15px]">{m === "dark" ? "🌙" : "☀️"}</span>
                {m}
              </button>
            ))}
          </div>

          <div className="mb-2.5 rounded-xl border border-white/10 bg-white/8 p-2.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">Wallpaper</p>
            <div className="grid grid-cols-5 gap-1.5">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWallpaper(w.id)}
                  title={w.name}
                  className={`h-8 rounded-md border-2 transition-colors ${
                    wallpaperId === w.id ? "border-[var(--accent)]" : "border-transparent hover:border-white/30"
                  }`}
                  style={{ backgroundImage: w.css, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { label: "Launchpad", glyph: "⌘", run: () => setLaunchpad(true), desktopOnly: false },
              { label: "Windows", glyph: "▦", run: () => setMissionControl(true), desktopOnly: false },
              // a list of keyboard shortcuts is no use on a device without one
              { label: "Keys", glyph: "⌨", run: () => setShortcuts(true), desktopOnly: true },
            ].map((b) => (
              <button
                key={b.label}
                onClick={() => {
                  setOpen(false);
                  b.run();
                }}
                className={`rounded-xl border border-white/10 bg-white/8 px-2 py-2.5 text-[11.5px] text-white/75 transition-colors hover:bg-white/14 ${
                  b.desktopOnly ? "hidden sm:block" : ""
                }`}
              >
                <span className="mb-1 block text-[15px]">{b.glyph}</span>
                {b.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              openApp("settings", { size: { w: 700, h: 520 } });
            }}
            className="mt-2.5 w-full rounded-xl border border-white/10 bg-white/8 py-2 text-[12.5px] text-white/75 transition-colors hover:bg-white/14"
          >
            System Settings…
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
