"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { appById } from "@/lib/apps";
import { useWindows, type WindowInstance, MENUBAR_H } from "@/lib/store";

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

export default function Window({ win, active }: { win: WindowInstance; active: boolean }) {
  const { close, focus, minimize, toggleMaximize, setRect } = useWindows();
  const app = appById(win.appId);
  const [closing, setClosing] = useState(false);
  const [minimizing, setMinimizing] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 760;

  /* ── drag the title bar ───────────────────────────────── */
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

      const move = (ev: PointerEvent) => {
        setRect(win.id, {
          x: Math.min(Math.max(60 - win.w, originX + ev.clientX - startX), maxX),
          y: Math.min(Math.max(MENUBAR_H, originY + ev.clientY - startY), maxY),
        });
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
    [win.id, win.x, win.y, win.w, win.maximized, isMobile, focus, setRect]
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
      animate={{
        opacity: closing || minimizing ? 0 : 1,
        scale: closing ? 0.94 : minimizing ? 0.28 : 1,
        y: minimizing ? window.innerHeight - win.y - 40 : 0,
      }}
      transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.7 }}
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
        <div className="flex items-center gap-[7px]" data-no-drag>
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
        <Body payload={win.payload} />
        {!active && <div className="pointer-events-none absolute inset-0 bg-black/8" />}
      </div>

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
      className="grid h-[12px] w-[12px] place-items-center rounded-full text-[9px] font-bold leading-none transition-colors"
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
