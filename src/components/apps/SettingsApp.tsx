"use client";

import { WALLPAPERS, useSystem } from "@/lib/store";

export default function SettingsApp() {
  const wallpaperId = useSystem((s) => s.wallpaperId);
  const setWallpaper = useSystem((s) => s.setWallpaper);
  const appearance = useSystem((s) => s.appearance);
  const dockLabels = useSystem((s) => s.dockLabels);
  const verseNote = useSystem((s) => s.verseNote);
  const setVerseNote = useSystem((s) => s.setVerseNote);
  const setDockLabels = useSystem((s) => s.setDockLabels);
  const apply = useSystem((s) => s.setAppearance);

  return (
    <div className="@container mac-scroll h-full overflow-y-auto p-6">
      <h1 className="mb-5 text-[20px] font-semibold tracking-[-0.02em]">Appearance</h1>

      <div className="mb-8 flex gap-3">
        {(["dark", "light"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => apply(mode)}
            className={`flex-1 rounded-xl border-2 p-2 transition-colors ${
              appearance === mode ? "border-[var(--accent)]" : "border-transparent hover:border-[var(--fill-3)]"
            }`}
          >
            <div
              className="mb-2 h-16 rounded-lg border border-black/20"
              style={{ background: mode === "dark" ? "linear-gradient(160deg,#2a2f3a,#12151c)" : "linear-gradient(160deg,#ffffff,#d9dee8)" }}
            />
            <span className="text-[12.5px] capitalize">{mode}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 text-[20px] font-semibold tracking-[-0.02em]">Desktop</h2>
      <label className="mb-6 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-[var(--hairline)] bg-[var(--fill-1)] p-3.5">
        <span className="min-w-0">
          <span className="block text-[13.5px]">Verse note</span>
          <span className="block text-[12px] text-lo">
            A sticky note on the desktop with a verse that changes daily. Drag it anywhere; ↻ shows another.
          </span>
        </span>
        <input
          type="checkbox"
          checked={verseNote}
          onChange={(e) => setVerseNote(e.target.checked)}
          aria-label="Show the verse note on the desktop"
          className="h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
      </label>

      <h2 className="mb-3 text-[20px] font-semibold tracking-[-0.02em]">Dock</h2>
      <label className="mb-8 flex items-center justify-between gap-4 rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-3.5 py-3">
        <span>
          <span className="block text-[13.5px]">Show app names</span>
          <span className="block text-[12px] text-lo">
            Names sit under each icon. Turning this off makes the icons larger, with the name on hover.
          </span>
        </span>
        <input
          type="checkbox"
          checked={dockLabels}
          onChange={(e) => setDockLabels(e.target.checked)}
          aria-label="Show app names in the Dock"
          className="h-4 w-4 shrink-0 accent-[var(--accent)]"
        />
      </label>

      <h2 className="mb-4 text-[20px] font-semibold tracking-[-0.02em]">Wallpaper</h2>
      <div className="grid grid-cols-2 gap-3 @[520px]:grid-cols-3">
        {WALLPAPERS.map((w) => (
          <button
            key={w.id}
            onClick={() => setWallpaper(w.id)}
            className={`rounded-xl border-2 p-1.5 text-left transition-colors ${
              wallpaperId === w.id ? "border-[var(--accent)]" : "border-transparent hover:border-[var(--fill-3)]"
            }`}
          >
            <div className="mb-1.5 h-[72px] rounded-lg border border-black/25 shadow-inner" style={{ backgroundImage: w.css, backgroundSize: "cover", backgroundPosition: "center" }} />
            <span className="block truncate px-0.5 text-[12px] text-mid">{w.name}</span>
          </button>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-[20px] font-semibold tracking-[-0.02em]">Keyboard</h2>
      <div className="overflow-hidden rounded-xl border border-[var(--glass-stroke)]">
        {[
          ["⌘ K", "Open Spotlight search"],
          ["⌘ W", "Close the focused window"],
          ["⌘ M", "Minimise the focused window"],
          ["Esc", "Dismiss Spotlight or a menu"],
          ["Double-click", "Open a desktop icon"],
          ["Right-click", "Desktop context menu"],
        ].map(([k, v], i) => (
          <div key={k} className={`flex items-center gap-4 px-3.5 py-2.5 ${i % 2 ? "bg-[var(--fill-1)]" : ""}`}>
            <kbd className="min-w-[88px] rounded-md border border-[var(--glass-stroke)] bg-[var(--fill-2)] px-2 py-0.5 text-center font-mono text-[11.5px]">{k}</kbd>
            <span className="text-[13px] text-mid">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
