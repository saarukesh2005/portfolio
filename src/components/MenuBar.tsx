"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { appById } from "@/lib/apps";
import { useSystem, useWindows } from "@/lib/store";
import { Glyph } from "@/components/Icons";
import { nowPlaying, profile } from "@/content/profile";

export default function MenuBar() {
  const windows = useWindows((s) => s.windows);
  const focusedId = useWindows((s) => s.focusedId());
  const openApp = useWindows((s) => s.open);
  const setSpotlight = useSystem((s) => s.setSpotlight);
  const setActiveMenu = useSystem((s) => s.setActiveMenu);
  const notify = useSystem((s) => s.notify);
  const setControlCentre = useSystem((s) => s.setControlCentre);
  const barRef = useRef<HTMLDivElement>(null);

  const focused = windows.find((w) => w.id === focusedId);
  const app = focused ? appById(focused.appId) : null;
  const appName = app?.name ?? "Finder";
  const menus = app?.menus ?? [
    { label: "File", items: ["New Finder Window  ⌘N", "---", "Close  ⌘W"] },
    { label: "Edit", items: ["Copy  ⌘C", "Paste  ⌘V"] },
    { label: "View", items: ["Launchpad  F4", "Mission Control  F3"] },
    { label: "Go", items: ["Desktop  ⇧⌘D", "Projects", "Résumé"] },
  ];

  useEffect(() => {
    const away = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setActiveMenu(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setActiveMenu(null);
    window.addEventListener("mousedown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousedown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [setActiveMenu]);

  const appleItems = [
    `About ${profile.name.split(" ")[0]}`,
    "---",
    "System Settings…",
    "Keyboard Shortcuts…  ⌘/",
    "---",
    "Projects",
    "Résumé",
    "Contact",
    "---",
    "Sleep",
    "Restart…",
  ];

  function runAppleItem(item: string) {
    setActiveMenu(null);
    if (item.startsWith("About")) openApp("about", { size: { w: 840, h: 560 } });
    else if (item.startsWith("System Settings")) openApp("settings", { size: { w: 700, h: 520 } });
    else if (item.startsWith("Keyboard Shortcuts")) useSystem.getState().setShortcuts(true);
    else if (item === "Projects") openApp("projects", { size: { w: 900, h: 610 } });
    else if (item === "Résumé") openApp("resume", { size: { w: 780, h: 640 } });
    else if (item === "Contact") openApp("mail", { size: { w: 720, h: 540 } });
    else if (item === "Sleep" || item === "Restart…")
      notify({ app: "System", title: `${item.replace("…", "")}?`, body: "Not on my watch — there's a portfolio to read.", emoji: "😴" });
  }

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 top-0 z-[9000] flex h-[28px] items-center gap-1 px-2.5 text-[13px] text-white"
      style={{
        background: "rgba(0,0,0,.28)",
        backdropFilter: "blur(26px) saturate(180%)",
        WebkitBackdropFilter: "blur(26px) saturate(180%)",
      }}
    >
      {/*  menu */}
      <MenuRoot id="apple" label={<span className="block px-1 py-[1px]">{Glyph.devilFruit}</span>} items={appleItems} onPick={runAppleItem} always />

      <MenuRoot id="app" always label={<span className="font-semibold">{appName}</span>} items={[`About ${appName}`, "---", `Hide ${appName}  ⌘H`, `Quit ${appName}  ⌘Q`]} onPick={(i) => {
        setActiveMenu(null);
        if (i.startsWith("Quit") && focused) useWindows.getState().close(focused.id);
      }} />

      {menus.map((m) => (
        <MenuRoot
          key={m.label}
          id={m.label}
          label={m.label}
          items={m.items}
          onPick={(item) => {
            setActiveMenu(null);
            if (item.startsWith("Launchpad")) useSystem.getState().setLaunchpad(true);
            else if (item.startsWith("Mission Control")) useSystem.getState().setMissionControl(true);
          }}
        />
      ))}

      {/* right cluster */}
      <div className="ml-auto flex items-center gap-3.5 pr-0.5">
        <button
          data-control-centre-trigger
          onClick={() => setControlCentre(!useSystem.getState().controlCentre)}
          className="opacity-85 transition-opacity hover:opacity-100"
          aria-label="Control Centre"
        >
          {Glyph.control}
        </button>
        <span className="hidden opacity-85 sm:block">{Glyph.wifi}</span>
        <span className="hidden opacity-85 sm:block">{Glyph.battery}</span>
        <button onClick={() => setSpotlight(true)} className="opacity-85 transition-opacity hover:opacity-100" aria-label="Spotlight search (⌘K)">
          {Glyph.search}
        </button>
        <Clock />
      </div>

      {/* Dynamic Island */}
      <Island />
    </div>
  );
}

function MenuRoot({
  id,
  label,
  items,
  onPick,
  always,
}: {
  id: string;
  label: React.ReactNode;
  items: (string | "---")[];
  onPick: (item: string) => void;
  /** the  menu and the active app name stay visible on phones */
  always?: boolean;
}) {
  const activeMenu = useSystem((s) => s.activeMenu);
  const setActiveMenu = useSystem((s) => s.setActiveMenu);
  const open = activeMenu === id;

  return (
    <div className="relative">
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          setActiveMenu(open ? null : id);
        }}
        onMouseEnter={() => activeMenu && !open && setActiveMenu(id)}
        className={`rounded px-2 py-[2px] transition-colors ${always ? "block" : "hidden sm:block"} ${open ? "bg-white/22" : "hover:bg-white/12"}`}
      >
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 top-[26px] min-w-[216px] rounded-lg border border-white/12 p-1 shadow-2xl"
            style={{ background: "rgba(42,44,52,.88)", backdropFilter: "blur(30px) saturate(180%)" }}
          >
            {items.map((it, i) =>
              it === "---" ? (
                <li key={i} className="my-1 h-px bg-white/12" />
              ) : (
                <li key={i}>
                  <button
                    onClick={() => onPick(it)}
                    className="flex w-full items-center justify-between gap-6 rounded px-2.5 py-[5px] text-left text-[13px] text-white/92 hover:bg-[var(--accent)] hover:text-white"
                  >
                    {it.includes("  ") ? (
                      <>
                        <span>{it.split("  ")[0]}</span>
                        <span className="font-mono text-[11.5px] opacity-55">{it.split("  ")[1]}</span>
                      </>
                    ) : (
                      it
                    )}
                  </button>
                </li>
              )
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // deferred to the next frame: the server has no clock to match, so the
    // first value has to land after hydration rather than during it
    const tick = () => setNow(new Date());
    const raf = requestAnimationFrame(tick);
    const t = setInterval(tick, 10_000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);
  if (!now) return <span className="w-[140px]" />;
  return (
    <span className="whitespace-nowrap tabular-nums">
      {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
      {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
    </span>
  );
}

/* ───────────────────────── Dynamic Island ─────────────────────────
   A now-playing widget, not a player: the bars, the scrolling title
   and the progress line are animations. No audio is embedded and no
   Spotify script is loaded — clicking opens the real track instead.
   ------------------------------------------------------------------ */

/** Resting heights of the equaliser bars, in px. */
const EQ = [9, 15, 7, 13, 10];

/** How long the fake progress line takes to cross the Island, in seconds. */
const SWEEP = 34;

function Island() {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.a
      href={nowPlaying.url}
      target="_blank"
      rel="noreferrer noopener"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      animate={{ width: expanded ? 292 : 152, height: expanded ? 48 : 26 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      aria-label={`Now playing: ${nowPlaying.title} — ${nowPlaying.artist}. Opens in Spotify.`}
      className="pointer-events-auto absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 items-center justify-center overflow-hidden rounded-b-[18px] bg-black no-underline md:flex"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,.6)" }}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.span
            key="open"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.14 }}
            className="flex w-full items-center gap-2.5 px-3.5"
          >
            <Artwork />
            <span className="min-w-0 flex-1 leading-tight">
              <Marquee text={nowPlaying.title} className="text-[11.5px] font-semibold text-white" />
              <span className="mt-[1px] block truncate text-[10px] text-white/55">{nowPlaying.artist}</span>
            </span>
            <Equaliser scale={1} />
          </motion.span>
        ) : (
          <motion.span
            key="shut"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="flex h-full items-center"
          >
            <Equaliser scale={0.62} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* progress line, pinned to the Island's bottom lip */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] overflow-hidden">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #1ed760, #86efac)" }}
          animate={{ width: ["4%", "100%"], opacity: expanded ? 1 : 0.42 }}
          transition={{
            width: { duration: SWEEP, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.2 },
          }}
        />
      </span>
    </motion.a>
  );
}

/** Stand-in album art: a Gear 5 red-to-gold tile with a spinning record. */
function Artwork() {
  return (
    <span
      className="relative grid h-[30px] w-[30px] shrink-0 place-items-center overflow-hidden rounded-[7px]"
      style={{ backgroundImage: "linear-gradient(145deg, #e8453c 0%, #f6c445 100%)" }}
    >
      <motion.span
        className="grid h-[19px] w-[19px] place-items-center rounded-full bg-black/80"
        animate={{ rotate: 360 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
      >
        <span className="h-[5px] w-[5px] rounded-full bg-white/85" />
        <span className="absolute h-[19px] w-[19px] rounded-full border border-white/15" />
      </motion.span>
    </span>
  );
}

/** Five bars bouncing on a stagger — the "audio is playing" tell. */
function Equaliser({ scale }: { scale: number }) {
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

/**
 * Scrolls its text only when the text is actually too wide, so a short
 * title sits still instead of sliding about for no reason.
 */
function Marquee({ text, className = "" }: { text: string; className?: string }) {
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
