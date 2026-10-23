"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MENUBAR_H, DOCK_RESERVE, useSystem } from "@/lib/store";
import { VERSE_THEMES, verseOfTheDay, verses } from "@/content/verses";

/* ───────────────────────────── verse note ─────────────────────────────
   A Stickies note on the desktop. It never pops up over anything and
   never steals focus — it sits where it is put, and closes for good
   from its own button or System Settings.
   ---------------------------------------------------------------------- */

const NOTE_W = 268;
/** enough of the note must stay on screen to be grabbed again */
const KEEP_VISIBLE = 72;
const MARGIN = 20;

/** Movement in pixels before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

export default function VerseNote() {
  const shown = useSystem((s) => s.verseNote);
  const setShown = useSystem((s) => s.setVerseNote);
  const pos = useSystem((s) => s.verseNotePos);
  const setPos = useSystem((s) => s.setVerseNotePos);

  /* The verse depends on today's date, which a prerendered page does not
     know — so it is chosen after mount, like the menu bar clock. Until
     then the note does not render at all. */
  const [index, setIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIndex(verseOfTheDay()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const shuffle = useCallback(() => {
    setIndex((i) => (i === null ? 0 : (i + 1) % verses.length));
  }, []);

  const startDrag = (e: React.PointerEvent, from: { x: number; y: number }) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        setDragging(true);
        document.body.style.userSelect = "none";
      }
      setPos(
        Math.min(Math.max(KEEP_VISIBLE - NOTE_W, from.x + dx), window.innerWidth - KEEP_VISIBLE),
        Math.min(Math.max(MENUBAR_H, from.y + dy), window.innerHeight - DOCK_RESERVE)
      );
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
      setDragging(false);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!shown || index === null) return null;

  const verse = verses[index];
  const at = pos ?? { x: MARGIN, y: MENUBAR_H + 24 };

  return (
    <AnimatePresence>
      <motion.aside
        key="verse-note"
        initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        onPointerDown={(e) => startDrag(e, at)}
        className="pointer-events-auto absolute z-[11] hidden select-none overflow-hidden rounded-[4px] sm:block"
        style={{
          left: at.x,
          top: at.y,
          width: NOTE_W,
          cursor: dragging ? "grabbing" : "grab",
          background: "linear-gradient(180deg, #fff6a9 0%, #ffeb84 100%)",
          boxShadow: dragging
            ? "0 18px 38px rgba(0,0,0,.5)"
            : "0 8px 22px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.7)",
        }}
      >
        {/* header strip, the way Stickies darkens its title bar */}
        <div className="flex items-center gap-2 bg-[#f6dd63] px-2.5 py-1.5">
          <span className="flex-1 truncate text-[10.5px] font-semibold uppercase tracking-wider text-[#6b5a10]">
            {VERSE_THEMES[verse.theme]}
          </span>
          <button
            onClick={shuffle}
            title="Another verse"
            aria-label="Show another verse"
            className="grid h-[18px] w-[18px] place-items-center rounded text-[11px] text-[#6b5a10] transition-colors hover:bg-black/12"
          >
            ↻
          </button>
          <button
            onClick={() => setShown(false)}
            title="Close — bring it back in System Settings"
            aria-label="Close the verse note"
            className="grid h-[18px] w-[18px] place-items-center rounded text-[13px] leading-none text-[#6b5a10] transition-colors hover:bg-black/12"
          >
            ×
          </button>
        </div>

        <blockquote className="px-3.5 pb-3 pt-2.5">
          <p className="text-[12.5px] leading-[1.55] text-[#3f3708]">
            {verse.partial && <span aria-hidden>… </span>}
            {verse.text}
          </p>
          <cite className="mt-2 block text-right text-[11px] font-semibold not-italic text-[#8a7416]">
            {verse.ref}
          </cite>
        </blockquote>
      </motion.aside>
    </AnimatePresence>
  );
}
