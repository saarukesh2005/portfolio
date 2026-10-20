"use client";

import { useEffect, useState } from "react";
import { APPS } from "@/lib/apps";
import { useWindows } from "@/lib/store";

export default function DesktopIcons() {
  const openApp = useWindows((s) => s.open);
  const [selected, setSelected] = useState<string | null>(null);
  const items = APPS.filter((a) => a.desktop);

  useEffect(() => {
    const clear = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-desktop-icon]")) setSelected(null);
    };
    window.addEventListener("mousedown", clear);
    return () => window.removeEventListener("mousedown", clear);
  }, []);

  function launch(id: string) {
    const app = APPS.find((a) => a.id === id);
    if (!app) return;
    if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
    else openApp(app.id, { size: app.size });
  }

  return (
    <div className="absolute right-3 top-9 z-[10] hidden flex-col items-center gap-1 sm:flex">
      {items.map((app) => (
        <button
          key={app.id}
          data-desktop-icon
          onClick={() => setSelected(app.id)}
          onDoubleClick={() => launch(app.id)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && launch(app.id)}
          className={`flex w-[88px] flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 transition-colors ${
            selected === app.id ? "bg-white/22 ring-1 ring-white/35" : "hover:bg-white/10"
          }`}
          title={`${app.name} — double-click to open`}
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
      ))}
    </div>
  );
}
