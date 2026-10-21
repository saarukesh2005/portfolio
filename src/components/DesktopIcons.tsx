"use client";

import { useCallback, useEffect, useState } from "react";
import { APPS } from "@/lib/apps";
import { MENUBAR_H, DOCK_RESERVE, useSystem, useWindows } from "@/lib/store";

const CELL_W = 92;
/* a two-line label ("System Settings") needs this much, or the next
   icon in the column lands on top of it */
const CELL_H = 90;
const ICON_W = 88;
const ROWS = 5;
const MARGIN = 12;

/** Movement in pixels before a press counts as a drag rather than a click. */
const DRAG_THRESHOLD = 4;

/**
 * The default arrangement: columns of six filling from the top-right corner
 * leftwards, the way macOS lays out a desktop.
 */
function gridPosition(index: number, vw: number) {
  const col = Math.floor(index / ROWS);
  const row = index % ROWS;
  return {
    x: Math.max(MARGIN, vw - MARGIN - (col + 1) * CELL_W),
    y: MENUBAR_H + 8 + row * CELL_H,
  };
}

export default function DesktopIcons() {
  const openApp = useWindows((s) => s.open);
  const setQuickLook = useSystem((s) => s.setQuickLook);
  const positions = useSystem((s) => s.iconPositions);
  const setIconPosition = useSystem((s) => s.setIconPosition);

  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  const items = APPS.filter((a) => a.desktop);

  /* viewport size drives the default grid; read after mount, never during render */
  useEffect(() => {
    const read = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    const raf = requestAnimationFrame(read);
    window.addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", read);
    };
  }, []);

  useEffect(() => {
    const clear = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-desktop-icon]")) setSelected(null);
    };
    window.addEventListener("mousedown", clear);
    return () => window.removeEventListener("mousedown", clear);
  }, []);

  /* space bar previews whatever is selected, as it does in Finder */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key !== " " || tag === "INPUT" || tag === "TEXTAREA") return;
      if (useSystem.getState().quickLook) return;
      e.preventDefault();
      setQuickLook(selected);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, setQuickLook]);

  const launch = useCallback(
    (id: string) => {
      const app = APPS.find((a) => a.id === id);
      if (!app) return;
      if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
      else openApp(app.id, { size: app.size });
    },
    [openApp]
  );

  const startDrag = (e: React.PointerEvent, id: string, from: { x: number; y: number }) => {
    if (e.button !== 0) return;
    setSelected(id);

    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        setDragging(id);
        document.body.style.userSelect = "none";
      }
      setIconPosition(
        id,
        Math.min(Math.max(0, from.x + dx), window.innerWidth - ICON_W),
        Math.min(Math.max(MENUBAR_H, from.y + dy), window.innerHeight - DOCK_RESERVE)
      );
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
      setDragging(null);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[10] hidden sm:block">
      {items.map((app, i) => {
        const pos = positions[app.id] ?? gridPosition(i, viewport.w);
        const isDragging = dragging === app.id;

        return (
          <button
            key={app.id}
            data-desktop-icon
            onPointerDown={(e) => startDrag(e, app.id, pos)}
            onDoubleClick={() => launch(app.id)}
            onKeyDown={(e) => e.key === "Enter" && launch(app.id)}
            title={`${app.name} — double-click to open, drag to move`}
            className={`pointer-events-auto absolute flex w-[88px] flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 ${
              isDragging
                ? "z-20 scale-[1.06] opacity-80"
                : selected === app.id
                  ? "bg-white/22 ring-1 ring-white/35 transition-colors"
                  : "transition-colors hover:bg-white/10"
            }`}
            style={{ left: pos.x, top: pos.y, cursor: isDragging ? "grabbing" : undefined }}
          >
            <span className="h-[50px] w-[50px] drop-shadow-lg">{app.icon}</span>
            <span
              className={`line-clamp-2 text-center text-[11.5px] leading-tight text-white ${
                selected === app.id ? "" : "[text-shadow:0_1px_3px_rgba(0,0,0,.85)]"
              }`}
            >
              {app.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
