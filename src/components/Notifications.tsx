"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSystem } from "@/lib/store";

export default function Notifications() {
  const toasts = useSystem((s) => s.toasts);
  const dismiss = useSystem((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed right-3 top-9 z-[9300] flex w-[330px] max-w-[calc(100vw-24px)] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-white/14 p-3 text-left shadow-2xl"
            style={{ background: "rgba(42,44,52,.86)", backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)" }}
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 text-[17px]">{t.emoji ?? "🔔"}</span>
            <span className="min-w-0 flex-1">
              <span className="mb-0.5 flex items-baseline justify-between gap-2">
                <span className="truncate text-[13px] font-semibold text-white">{t.title}</span>
                <span className="shrink-0 text-[11px] text-white/40">{t.app}</span>
              </span>
              <span className="block text-[12.5px] leading-snug text-white/65">{t.body}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
