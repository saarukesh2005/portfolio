"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { appById } from "@/lib/apps";
import { useSystem, useWindows } from "@/lib/store";

export default function MissionControl() {
  const open = useSystem((s) => s.missionControl);
  const setOpen = useSystem((s) => s.setMissionControl);
  const windows = useWindows((s) => s.windows);
  const restore = useWindows((s) => s.restore);
  const close = useWindows((s) => s.close);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F3") {
        e.preventDefault();
        setOpen(!useSystem.getState().missionControl);
      }
      if (e.key === "Escape" && useSystem.getState().missionControl) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[9200] flex flex-col items-center px-6 pt-[64px]"
          style={{
            background: "rgba(10,12,18,.6)",
            backdropFilter: "blur(34px) saturate(150%)",
            WebkitBackdropFilter: "blur(34px) saturate(150%)",
          }}
        >
          <p className="mb-6 text-[12px] uppercase tracking-[0.16em] text-white/45">
            {windows.length ? `${windows.length} open window${windows.length === 1 ? "" : "s"}` : "Mission Control"}
          </p>

          <div className="grid w-full max-w-[880px] grid-cols-2 gap-4 sm:grid-cols-3" onClick={(e) => e.stopPropagation()}>
            {windows.map((w, i) => {
              const app = appById(w.appId);
              if (!app) return null;
              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, scale: 0.94, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), type: "spring", stiffness: 420, damping: 32 }}
                  className="group relative"
                >
                  <button
                    onClick={() => {
                      restore(w.id);
                      setOpen(false);
                    }}
                    className="flex w-full flex-col items-start gap-3 rounded-2xl border border-white/14 bg-white/8 p-4 text-left transition-colors hover:border-white/30 hover:bg-white/14"
                  >
                    <span className="h-11 w-11">{app.icon}</span>
                    <span>
                      <span className="block text-[14px] font-medium text-white">{app.name}</span>
                      <span className="block text-[12px] text-white/50">
                        {w.minimized ? "Minimised" : `${Math.round(w.w)} × ${Math.round(w.h)}`}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => close(w.id)}
                    aria-label={`Close ${app.name}`}
                    className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#ff5f57] text-[12px] font-bold text-black/60 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    ×
                  </button>
                </motion.div>
              );
            })}
          </div>

          {windows.length === 0 && (
            <p className="mt-12 text-center text-[13.5px] text-white/45">
              Nothing open. Press <kbd className="font-mono">F4</kbd> for Launchpad, or{" "}
              <kbd className="font-mono">⌘K</kbd> to search.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
