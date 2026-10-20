"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WALLPAPERS, useSystem, useWindows } from "@/lib/store";

type Pos = { x: number; y: number } | null;

export default function ContextMenu() {
  const [pos, setPos] = useState<Pos>(null);
  const [subOpen, setSubOpen] = useState(false);
  const setWallpaper = useSystem((s) => s.setWallpaper);
  const setSpotlight = useSystem((s) => s.setSpotlight);
  const openApp = useWindows((s) => s.open);
  const windows = useWindows((s) => s.windows);
  const minimize = useWindows((s) => s.minimize);

  useEffect(() => {
    const onContext = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      // only the desktop surface gets our menu; inside windows the native one is more useful
      if (!t.closest("[data-desktop-surface]") || t.closest("[role=dialog]")) return;
      e.preventDefault();
      setSubOpen(false);
      setPos({ x: Math.min(e.clientX, window.innerWidth - 230), y: Math.min(e.clientY, window.innerHeight - 290) });
    };
    const close = () => setPos(null);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, []);

  const items = [
    { label: "New Terminal Window", run: () => openApp("terminal", { size: { w: 760, h: 480 } }) },
    { label: "Open Projects", run: () => openApp("projects", { size: { w: 900, h: 610 } }) },
    "---" as const,
    { label: "Spotlight Search…", hint: "⌘K", run: () => setSpotlight(true) },
    { label: "Launchpad", hint: "F4", run: () => useSystem.getState().setLaunchpad(true) },
    { label: "Mission Control", hint: "F3", run: () => useSystem.getState().setMissionControl(true) },
    { label: "Hide All Windows", run: () => windows.forEach((w) => minimize(w.id)) },
    "---" as const,
    { label: "Change Wallpaper", sub: true },
    { label: "System Settings…", run: () => openApp("settings", { size: { w: 700, h: 520 } }) },
  ];

  return (
    <AnimatePresence>
      {pos && (
        <motion.ul
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.11 }}
          onMouseDown={(e) => e.stopPropagation()}
          className="fixed z-[9400] w-[220px] origin-top-left rounded-lg border border-white/14 p-1 shadow-2xl"
          style={{ left: pos.x, top: pos.y, background: "rgba(42,44,52,.9)", backdropFilter: "blur(32px) saturate(180%)" }}
        >
          {items.map((it, i) =>
            it === "---" ? (
              <li key={i} className="my-1 h-px bg-white/12" />
            ) : it.sub ? (
              <li key={i} className="relative" onMouseEnter={() => setSubOpen(true)} onMouseLeave={() => setSubOpen(false)}>
                <button className="flex w-full items-center justify-between rounded px-2.5 py-[5px] text-left text-[13px] text-white/92 hover:bg-[var(--accent)]">
                  {it.label}
                  <span className="text-[10px] opacity-60">▶</span>
                </button>
                {subOpen && (
                  <ul
                    className="absolute left-[210px] top-0 w-[180px] rounded-lg border border-white/14 p-1 shadow-2xl"
                    style={{ background: "rgba(42,44,52,.92)", backdropFilter: "blur(32px) saturate(180%)" }}
                  >
                    {WALLPAPERS.map((w) => (
                      <li key={w.id}>
                        <button
                          onClick={() => {
                            setWallpaper(w.id);
                            setPos(null);
                          }}
                          className="flex w-full items-center gap-2.5 rounded px-2 py-[5px] text-left text-[13px] text-white/92 hover:bg-[var(--accent)]"
                        >
                          <span className="h-5 w-7 shrink-0 rounded border border-white/20" style={{ backgroundImage: w.css, backgroundSize: "cover", backgroundPosition: "center" }} />
                          {w.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={i}>
                <button
                  onClick={() => {
                    it.run?.();
                    setPos(null);
                  }}
                  className="flex w-full items-center justify-between rounded px-2.5 py-[5px] text-left text-[13px] text-white/92 hover:bg-[var(--accent)]"
                >
                  {it.label}
                  {it.hint && <span className="font-mono text-[11px] opacity-55">{it.hint}</span>}
                </button>
              </li>
            )
          )}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
