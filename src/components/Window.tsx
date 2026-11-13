"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { appById } from "@/lib/apps";
import { useWindows, type WindowInstance, MENUBAR_H, DOCK_RESERVE } from "@/lib/store";

const MIN_W = 360;
const MIN_H = 240;

/** Which edges a resize handle pulls. */
const HANDLES = [
  { dir: "n",  cls: "top-0 left-3 right-3 h-1.5 cursor-ns-resize" },
  { dir: "s",  cls: "bottom-0 left-3 right-3 h-1.5 cursor-ns-resize" },
  { dir: "w",  cls: "left-0 top-3 bottom-3 w-1.5 cursor-ew-resize" },
  { dir: "e",  cls: "right-0 top-3 bottom-3 w-1.5 cursor-ew-resize" },
  { dir: "nw", cls: "top-0 left-0 h-3 w-3 cursor-nwse-resize" },
  { dir: "ne", cls: "top-0 right-0 h-3 w-3 cursor-nesw-resize" },
  { dir: "sw", cls: "bottom-0 left-0 h-3 w-3 cursor-nesw-resize" },
  { dir: "se", cls: "bottom-0 right-0 h-3 w-3 cursor-nwse-resize" },
] as const;

/* how close to an edge a drag has to end for the window to snap, in px */
const SNAP = 28;

export default function Window({ win, active }: { win: WindowInstance; active: boolean }) {
  const { close, focus, minimize, toggleMaximize, setRect } = useWindows();
  const app = appById(win.appId);
  const [closing, setClosing] = useState(false);
  const [minimizing, setMinimizing] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 760;

  /* ── drag the title bar ───────────────────────────────── */
  const [snap, setSnap] = useState<"left" | "right" | "full" | null>(null);

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      if (win.maximized || isMobile) return;
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      e.preventDefault();
      focus(win.id);

      const startX = e.clientX;
      const startY = e.clientY;
      const originX = win.x;
      const originY = win.y;
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 40;

      /* where the pointer ended decides the snap, not where the window did —
         dragging a window by its right edge should still snap left if that
         is where you took the cursor */
      let lastX = startX;
      let lastY = startY;

      const move = (ev: PointerEvent) => {
        lastX = ev.clientX;
        lastY = ev.clientY;
        setRect(win.id, {
          x: Math.min(Math.max(60 - win.w, originX + ev.clientX - startX), maxX),
          y: Math.min(Math.max(MENUBAR_H, originY + ev.clientY - startY), maxY),
        });
        setSnap(ev.clientY < MENUBAR_H + SNAP ? "full" : ev.clientX < SNAP ? "left" : ev.clientX > window.innerWidth - SNAP ? "right" : null);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.userSelect = "";

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const zone =
          lastY < MENUBAR_H + SNAP ? "full" : lastX < SNAP ? "left" : lastX > vw - SNAP ? "right" : null;
        setSnap(null);
        if (!zone) return;

        const h = vh - MENUBAR_H - DOCK_RESERVE + 40;
        if (zone === "full") toggleMaximize(win.id, { w: vw, h: vh - 92 });
        else setRect(win.id, { x: zone === "left" ? 0 : Math.round(vw / 2), y: MENUBAR_H, w: Math.round(vw / 2), h });
      };
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [win.id, win.x, win.y, win.w, win.maximized, isMobile, focus, setRect, toggleMaximize]
  );

  /* ── resize from any edge ─────────────────────────────── */
  const startResize = useCallback(
    (e: React.PointerEvent, dir: string) => {
      if (win.maximized || isMobile) return;
      e.preventDefault();
      e.stopPropagation();
      focus(win.id);

      const sx = e.clientX;
      const sy = e.clientY;
      const o = { x: win.x, y: win.y, w: win.w, h: win.h };

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - sx;
        const dy = ev.clientY - sy;
        const next = { ...o };

        if (dir.includes("e")) next.w = Math.max(MIN_W, o.w + dx);
        if (dir.includes("s")) next.h = Math.max(MIN_H, o.h + dy);
        if (dir.includes("w")) {
          next.w = Math.max(MIN_W, o.w - dx);
          next.x = o.x + (o.w - next.w);
        }
        if (dir.includes("n")) {
          next.h = Math.max(MIN_H, o.h - dy);
          next.y = Math.max(MENUBAR_H, o.y + (o.h - next.h));
        }
        setRect(win.id, next);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        document.body.style.userSelect = "";
      };
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [win, isMobile, focus, setRect]
  );

  const doClose = () => {
    setClosing(true);
    setTimeout(() => close(win.id), 150);
  };
  const doMinimize = () => {
    setMinimizing(true);
    setTimeout(() => {
      minimize(win.id);
      setMinimizing(false);
    }, 230);
  };
  const doZoom = () => toggleMaximize(win.id, { w: window.innerWidth, h: window.innerHeight - 92 });

  /* ⌘W / ⌘M on the focused window */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        doClose();
      } else if (e.key.toLowerCase() === "m" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        doMinimize();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, win.id]);

  if (!app?.Component) return null;
  const Body = app.Component;

  return (
    <motion.div
      ref={frame}
      role="dialog"
      aria-label={app.name}
      initial={{ opacity: 0, scale: 0.94, y: 10 }}
      /* Minimising is a genie: the real one warps the window along a curve,
         which needs a mesh. Squeezing hard on X while falling toward the
         dock and rounding the corners off reads as the same gesture, and
         easing in rather than springing gives it the suck. */
      animate={{
        opacity: closing || minimizing ? 0 : 1,
        scale: closing ? 0.94 : 1,
        scaleX: minimizing ? 0.12 : 1,
        scaleY: minimizing ? 0.3 : 1,
        x: minimizing ? window.innerWidth / 2 - (win.x + win.w / 2) : 0,
        y: minimizing ? window.innerHeight - win.y - 30 : 0,
        borderRadius: minimizing ? 48 : 12,
      }}
      transition={
        minimizing
          ? { duration: 0.42, ease: [0.42, 0, 0.9, 0.62] }
          : { type: "spring", stiffness: 520, damping: 38, mass: 0.7 }
      }
      onPointerDown={() => focus(win.id)}
      className={`window-surface absolute flex flex-col overflow-hidden rounded-xl ${
        active ? "window-shadow" : "window-shadow-inactive"
      }`}
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        transformOrigin: "bottom center",
      }}
    >
      {/* title bar */}
      <div
        onPointerDown={startDrag}
        onDoubleClick={doZoom}
        className={`group/bar relative flex h-[38px] shrink-0 items-center gap-2 border-b border-[var(--glass-stroke)] px-3 ${
          win.maximized || isMobile ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        style={{ background: "var(--win-chrome)" }}
      >
        {/* traffic lights */}
        <div className="flex items-center gap-[13px] sm:gap-[7px]" data-no-drag>
          <TrafficLight color="#ff5f57" ring="#e0443e" label="Close" onClick={doClose} active={active} glyph="×" />
          <TrafficLight color="#febc2e" ring="#dea123" label="Minimise" onClick={doMinimize} active={active} glyph="−" />
          <TrafficLight color="#28c840" ring="#1dad2b" label="Zoom" onClick={doZoom} active={active} glyph="+" />
        </div>

        <span
          className={`pointer-events-none absolute left-1/2 -translate-x-1/2 truncate px-16 text-[13px] font-medium ${
            active ? "text-[var(--text-hi)]" : "text-lo"
          }`}
        >
          {app.name}
        </span>
      </div>

      {/* body */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Body payload={win.payload} active={active} />
        {/* A pane that ends mid-button reads as a rendering fault rather than
            as "there is more below". One soft edge here covers every app. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.22), transparent)" }}
        />
        {!active && <div className="pointer-events-none absolute inset-0 bg-black/8" />}
      </div>

      {/* where it will land, shown while the drag is still live */}
      {snap && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[7999] rounded-xl border-2 border-white/45 bg-white/12"
          style={
            snap === "full"
              ? { left: 0, top: MENUBAR_H, width: "100vw", height: `calc(100vh - ${MENUBAR_H + 52}px)` }
              : {
                  left: snap === "left" ? 0 : "50vw",
                  top: MENUBAR_H,
                  width: "50vw",
                  height: `calc(100vh - ${MENUBAR_H + DOCK_RESERVE - 40}px)`,
                }
          }
        />
      )}

      {/* resize handles */}
      {!win.maximized && !isMobile &&
        HANDLES.map((h) => (
          <div key={h.dir} onPointerDown={(e) => startResize(e, h.dir)} className={`absolute z-20 ${h.cls}`} />
        ))}
    </motion.div>
  );
}

function TrafficLight({
  color,
  ring,
  label,
  glyph,
  onClick,
  active,
}: {
  color: string;
  ring: string;
  label: string;
  glyph: string;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      /*
       * The dot stays small, but `before` stretches the tappable area to the
       * full height of the title bar and past the dot on both sides — 12px is
       * nowhere near a usable touch target on a phone.
       */
      className="relative grid h-[15px] w-[15px] place-items-center rounded-full text-[10px] font-bold leading-none transition-colors before:absolute before:-inset-x-[7px] before:-inset-y-3 before:content-[''] sm:h-[12px] sm:w-[12px] sm:text-[9px] sm:before:-inset-x-0.5 sm:before:-inset-y-1.5"
      style={{
        background: active ? color : "var(--light-off)",
        boxShadow: `inset 0 0 0 .5px ${active ? ring : "transparent"}`,
        color: "rgba(0,0,0,.55)",
      }}
    >
      <span className="opacity-0 transition-opacity group-hover/bar:opacity-100">{glyph}</span>
    </button>
  );
}
