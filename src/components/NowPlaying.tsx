"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { nowPlaying } from "@/content/profile";

/* ──────────────────────────── now playing ────────────────────────────
   A widget, not a player: the bars, the scrolling title and the
   progress line are animations. No audio is embedded and no Spotify
   script is loaded, so the page stays fast and sets no third-party
   cookies. Clicking opens the real track on Spotify instead.

   Shared by the Dynamic Island (desktop) and Control Centre (every
   size), so a phone still gets to see it.
   -------------------------------------------------------------------- */

/** Cover art, shown while the track is "playing". */
export const COVER = "/overtaken-gear5.webp";

/** Resting heights of the equaliser bars, in px. */
const EQ = [9, 15, 7, 13, 10];

/** How long the progress line takes to cross, in seconds. */
const SWEEP = 34;

/** The track's cover art, breathing gently while it "plays". */
export function Artwork({ size }: { size: number }) {
  return (
    <motion.span
      className="relative block shrink-0 overflow-hidden rounded-[8px] bg-[#0b1020]"
      style={{
        width: size,
        height: size,
        boxShadow: "0 0 0 1px rgba(255,255,255,.14), 0 2px 8px rgba(0,0,0,.55)",
      }}
      animate={{ scale: [1, 1.045, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image src={COVER} alt="" fill sizes={`${size}px`} className="object-cover" />
    </motion.span>
  );
}

/** Bars bouncing on a stagger — the "audio is playing" tell. */
export function Equaliser({ scale = 1 }: { scale?: number }) {
  return (
    <span className="flex shrink-0 items-end gap-[2px]" aria-hidden>
      {EQ.map((h, i) => {
        const peak = h * scale;
        return (
          <motion.span
            key={i}
            className="w-[2.5px] rounded-full"
            style={{ background: "#1ed760" }}
            animate={{ height: [peak * 0.35, peak, peak * 0.5, peak * 0.85, peak * 0.35] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
          />
        );
      })}
    </span>
  );
}

/** The sweeping progress line. `dim` fades it for the resting notch. */
export function ProgressLine({ dim = false, className = "" }: { dim?: boolean; className?: string }) {
  return (
    <span className={`pointer-events-none overflow-hidden ${className}`}>
      <motion.span
        className="block h-full rounded-full"
        style={{ background: "linear-gradient(90deg, #1ed760, #86efac)" }}
        animate={{ width: ["4%", "100%"], opacity: dim ? 0.42 : 1 }}
        transition={{
          width: { duration: SWEEP, repeat: Infinity, ease: "linear" },
          opacity: { duration: 0.2 },
        }}
      />
    </span>
  );
}

/**
 * Scrolls its text only when the text is actually too wide, so a short
 * title sits still instead of sliding about for no reason.
 */
export function Marquee({ text, className = "" }: { text: string; className?: string }) {
  const frame = useRef<HTMLSpanElement>(null);
  const run = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const f = frame.current;
    const r = run.current;
    if (!f || !r) return;
    const overflow = r.scrollWidth - f.clientWidth;
    setShift(overflow > 2 ? overflow + 6 : 0);
  }, [text]);

  return (
    <span ref={frame} className={`block overflow-hidden whitespace-nowrap ${className}`}>
      <motion.span
        ref={run}
        className="inline-block"
        animate={shift ? { x: [0, 0, -shift, -shift, 0] } : { x: 0 }}
        transition={
          shift
            ? { duration: 8, times: [0, 0.12, 0.5, 0.62, 1], repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        {text}
      </motion.span>
    </span>
  );
}

/** The Control Centre row — the phone's way in, since it has no notch. */
export function NowPlayingCard() {
  return (
    <a
      href={nowPlaying.url}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Now playing: ${nowPlaying.title} — ${nowPlaying.artist}. Opens in Spotify.`}
      className="relative mb-2.5 flex items-center gap-2.5 overflow-hidden rounded-xl border border-white/10 bg-white/8 p-2.5 no-underline transition-colors hover:bg-white/14"
    >
      <Artwork size={38} />
      <span className="min-w-0 flex-1 leading-tight">
        <span className="mb-[3px] block text-[9.5px] font-semibold uppercase tracking-wider text-white/40">
          Now playing
        </span>
        <Marquee text={nowPlaying.title} className="text-[12px] font-semibold text-white" />
        <span className="mt-[1px] block truncate text-[10.5px] text-white/55">{nowPlaying.artist}</span>
      </span>
      <Equaliser />
      <ProgressLine className="absolute inset-x-0 bottom-0 h-[2px]" />
    </a>
  );
}
