"use client";

import { useEffect } from "react";
import { useSystem } from "@/lib/store";
import { VERSE_THEMES, verseOfTheDay, verses } from "@/content/verses";

/* ─────────────────────────── verse notification ───────────────────────
   One verse per visit, as a notification. It arrives after the welcome
   toast so the two do not land together, and stays up long enough to
   actually be read. Turned off in System Settings.
   ---------------------------------------------------------------------- */

/** How long after the desktop appears the verse arrives, in ms. */
const DELAY = 4000;

/** A verse takes longer to read than a one-line alert. */
const HOLD = 12_000;

export default function VerseToast() {
  const shown = useSystem((s) => s.verseNote);
  const notify = useSystem((s) => s.notify);

  useEffect(() => {
    if (!shown) return;

    /* The verse depends on today's date, which a prerendered page does not
       know — so it is read here, after mount, never during render. */
    const t = setTimeout(() => {
      const verse = verses[verseOfTheDay()];
      notify({
        app: VERSE_THEMES[verse.theme],
        title: verse.ref,
        body: (verse.partial ? "… " : "") + verse.text,
        emoji: "📖",
        hold: HOLD,
      });
    }, DELAY);

    return () => clearTimeout(t);
  }, [shown, notify]);

  return null;
}
