"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { APPS } from "@/lib/apps";
import { useSystem, useWindows } from "@/lib/store";
import { Glyph } from "@/components/Icons";

export default function Launchpad() {
  const open = useSystem((s) => s.launchpad);
  const setOpen = useSystem((s) => s.setLaunchpad);
  const openApp = useWindows((s) => s.open);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setQ(""), 30);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        setOpen(!useSystem.getState().launchpad);
      }
      if (e.key === "Escape" && useSystem.getState().launchpad) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const needle = q.toLowerCase().trim();
  const shown = APPS.filter(
    (a) => !needle || a.name.toLowerCase().includes(needle) || a.keywords.some((k) => k.includes(needle))
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[9200] flex flex-col items-center pt-[72px]"
          style={{
            background: "rgba(12,14,20,.55)",
            backdropFilter: "blur(42px) saturate(160%)",
            WebkitBackdropFilter: "blur(42px) saturate(160%)",
          }}
        >
          <motion.div
            initial={{ scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.06, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-[860px] flex-col items-center px-6"
          >
            <div className="mb-9 flex w-[280px] items-center gap-2 rounded-lg border border-white/14 bg-white/12 px-3 py-1.5">
              <span className="text-white/55">{Glyph.search}</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus={typeof window !== "undefined" && window.innerWidth >= 760}
                placeholder="Search"
                aria-label="Search apps"
                className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/40"
              />
            </div>

            <div className="grid w-full grid-cols-4 gap-x-4 gap-y-7 sm:grid-cols-6">
              {shown.map((app, i) => (
                <motion.button
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.018, 0.25) }}
                  onClick={() => {
                    setOpen(false);
                    if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
                    else openApp(app.id, { size: app.size });
                  }}
                  className="group flex flex-col items-center gap-2"
                >
                  <span className="h-[62px] w-[62px] transition-transform duration-150 group-hover:scale-[1.09]">
                    {app.icon}
                  </span>
                  <span className="text-center text-[12px] leading-tight text-white [text-shadow:0_1px_3px_rgba(0,0,0,.7)]">
                    {app.name}
                  </span>
                </motion.button>
              ))}
            </div>

            {shown.length === 0 && (
              <p className="mt-10 text-[13.5px] text-white/45">No apps match “{q}”.</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
