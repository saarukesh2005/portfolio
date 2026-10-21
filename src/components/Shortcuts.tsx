"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSystem } from "@/lib/store";

const GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: "System",
    rows: [
      ["⌘ K", "Spotlight search"],
      ["F4", "Launchpad"],
      ["F3", "Mission Control"],
      ["⌘ /", "This list"],
      ["Esc", "Dismiss any overlay"],
    ],
  },
  {
    title: "Windows",
    rows: [
      ["⌘ W", "Close the focused window"],
      ["⌘ M", "Minimise it"],
      ["Double-click title", "Zoom"],
      ["Drag edges", "Resize"],
    ],
  },
  {
    title: "Desktop",
    rows: [
      ["Double-click icon", "Open it"],
      ["Space", "Quick Look the selected icon"],
      ["Drag", "Move a desktop icon anywhere"],
      ["Right-click", "Desktop menu"],
      ["⌘ P", "Print the résumé"],
    ],
  },
  {
    title: "Terminal",
    rows: [
      ["↑ / ↓", "Command history"],
      ["Tab", "Autocomplete"],
      ["⌘ L", "Clear the buffer"],
    ],
  },
];

export default function Shortcuts() {
  const open = useSystem((s) => s.shortcuts);
  const setOpen = useSystem((s) => s.setShortcuts);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen(!useSystem.getState().shortcuts);
      }
      if (e.key === "Escape" && useSystem.getState().shortcuts) setOpen(false);
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
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[9450] grid place-items-center bg-black/35 px-5 backdrop-blur-[3px]"
        >
          <motion.div
            initial={{ scale: 0.96, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 460, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-white/16 shadow-2xl"
            style={{ background: "rgba(38,40,48,.88)", backdropFilter: "blur(40px) saturate(170%)" }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h2 className="text-[15px] font-semibold text-white">Keyboard Shortcuts</h2>
              <kbd className="rounded border border-white/18 px-1.5 py-0.5 font-mono text-[10.5px] text-white/50">esc</kbd>
            </div>

            <div className="mac-scroll grid max-h-[62vh] gap-x-8 gap-y-5 overflow-y-auto p-5 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <section key={g.title}>
                  <h3 className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/35">{g.title}</h3>
                  <div className="space-y-1.5">
                    {g.rows.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between gap-4">
                        <span className="text-[13px] text-white/75">{v}</span>
                        <kbd className="shrink-0 rounded-md border border-white/16 bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-white/80">
                          {k}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
