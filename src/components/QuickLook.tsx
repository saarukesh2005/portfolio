"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { appById } from "@/lib/apps";
import { useSystem, useWindows } from "@/lib/store";

/**
 * macOS Quick Look: select something on the desktop, tap the space bar, get a
 * preview without opening it. Space again, or Escape, dismisses.
 */
export default function QuickLook() {
  const appId = useSystem((s) => s.quickLook);
  const setQuickLook = useSystem((s) => s.setQuickLook);
  const openApp = useWindows((s) => s.open);
  const app = appId ? appById(appId) : null;

  useEffect(() => {
    if (!appId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        setQuickLook(null);
      }
      if (e.key === "Enter" && app) {
        e.preventDefault();
        setQuickLook(null);
        if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
        else openApp(app.id, { size: app.size });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appId, app, openApp, setQuickLook]);

  return (
    <AnimatePresence>
      {app && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onClick={() => setQuickLook(null)}
          className="fixed inset-0 z-[9420] grid place-items-center bg-black/35 px-5 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/16 shadow-2xl"
            style={{ background: "rgba(38,40,48,.9)", backdropFilter: "blur(40px) saturate(170%)" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="truncate text-[13px] font-medium text-white">{app.name}</span>
              <kbd className="shrink-0 rounded border border-white/18 px-1.5 py-0.5 font-mono text-[10px] text-white/45">
                space
              </kbd>
            </div>

            <div className="flex flex-col items-center px-6 py-7 text-center">
              <span className="h-[104px] w-[104px] drop-shadow-xl">{app.icon}</span>
              <h2 className="mt-4 text-[18px] font-semibold text-white">{app.name}</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-white/60">{app.blurb}</p>
            </div>

            <div className="flex gap-2 border-t border-white/10 p-3">
              <button
                onClick={() => {
                  setQuickLook(null);
                  if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
                  else openApp(app.id, { size: app.size });
                }}
                className="flex-1 rounded-lg bg-white py-2 text-[13px] font-medium text-[#14161d] transition-opacity hover:opacity-88"
              >
                Open {app.href ? "link" : app.name}
              </button>
              <button
                onClick={() => setQuickLook(null)}
                className="rounded-lg border border-white/14 bg-white/8 px-3.5 py-2 text-[13px] text-white/75 transition-colors hover:bg-white/16"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
