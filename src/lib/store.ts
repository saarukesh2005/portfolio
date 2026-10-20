"use client";

import { create } from "zustand";

/* ────────────────────────────── windows ────────────────────────────── */

export type Rect = { x: number; y: number; w: number; h: number };

export type WindowInstance = Rect & {
  id: string;
  appId: string;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: Rect;
  /** arbitrary data handed to the app component, e.g. a selected project id */
  payload?: unknown;
};

export const MENUBAR_H = 28;
const MIN_W = 360;
const MIN_H = 240;
export const DOCK_RESERVE = 96;

type OpenOptions = {
  payload?: unknown;
  /** when set, opening the same app+key focuses the existing window instead of making a new one */
  singletonKey?: string;
  size?: { w: number; h: number };
};

type WindowStore = {
  windows: WindowInstance[];
  topZ: number;
  open: (appId: string, opts?: OpenOptions) => string;
  close: (id: string) => void;
  closeApp: (appId: string) => void;
  focus: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  toggleMaximize: (id: string, bounds: { w: number; h: number }) => void;
  setRect: (id: string, rect: Partial<Rect>) => void;
  /** re-fit every window after the viewport changes size */
  reflow: (vw: number, vh: number) => void;
  isRunning: (appId: string) => boolean;
  focusedId: () => string | null;
};

/** Lay each new window down slightly offset from the last, like the real thing. */
function cascade(index: number, w: number, h: number) {
  const vw = typeof window === "undefined" ? 1440 : window.innerWidth;
  const vh = typeof window === "undefined" ? 900 : window.innerHeight;
  const step = 28;
  const baseX = Math.max(16, (vw - w) / 2 - 60);
  const baseY = Math.max(MENUBAR_H + 12, (vh - DOCK_RESERVE - h) / 2);
  const x = baseX + (index % 6) * step;
  const y = baseY + (index % 6) * step;
  return {
    x: Math.min(Math.max(8, x), Math.max(8, vw - w - 8)),
    y: Math.min(Math.max(MENUBAR_H + 4, y), Math.max(MENUBAR_H + 4, vh - DOCK_RESERVE - 40)),
  };
}

let seq = 0;

export const useWindows = create<WindowStore>((set, get) => ({
  windows: [],
  topZ: 10,

  open: (appId, opts = {}) => {
    const key = opts.singletonKey ?? appId;
    const existing = get().windows.find((w) => (w.payload as { key?: string })?.key === key || (!opts.payload && w.appId === appId));

    if (existing) {
      get().restore(existing.id);
      get().focus(existing.id);
      return existing.id;
    }

    const size = opts.size ?? { w: 820, h: 560 };
    const vw = typeof window === "undefined" ? 1440 : window.innerWidth;
    const mobile = vw < 760;

    const w = mobile ? vw - 16 : Math.min(size.w, vw - 48);
    const h = mobile
      ? (typeof window === "undefined" ? 700 : window.innerHeight) - MENUBAR_H - DOCK_RESERVE - 8
      : Math.min(size.h, (typeof window === "undefined" ? 900 : window.innerHeight) - MENUBAR_H - DOCK_RESERVE);

    const pos = mobile ? { x: 8, y: MENUBAR_H + 6 } : cascade(get().windows.length, w, h);
    const id = `win-${++seq}`;
    const z = get().topZ + 1;

    set((s) => ({
      topZ: z,
      windows: [
        ...s.windows,
        { id, appId, z, minimized: false, maximized: false, payload: opts.payload, ...pos, w, h },
      ],
    }));
    return id;
  },

  close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

  closeApp: (appId) => set((s) => ({ windows: s.windows.filter((w) => w.appId !== appId) })),

  focus: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)) };
    }),

  minimize: (id) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)) })),

  restore: (id) =>
    set((s) => {
      const z = s.topZ + 1;
      return { topZ: z, windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: false, z } : w)) };
    }),

  toggleMaximize: (id, bounds) =>
    set((s) => ({
      windows: s.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.maximized && w.restore) return { ...w, maximized: false, ...w.restore, restore: undefined };
        return {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: MENUBAR_H,
          w: bounds.w,
          h: bounds.h - MENUBAR_H,
        };
      }),
    })),

  setRect: (id, rect) => set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...rect } : w)) })),

  /*
   * Windows hold fixed geometry, so without this a phone rotation or a browser
   * resize leaves them at their old size — a desktop-width window on a phone
   * hangs off-screen with its controls out of reach.
   */
  reflow: (vw, vh) =>
    set((s) => {
      const mobile = vw < 760;
      const maxH = vh - MENUBAR_H - DOCK_RESERVE;

      return {
        windows: s.windows.map((w) => {
          if (mobile) {
            return { ...w, x: 8, y: MENUBAR_H + 6, w: vw - 16, h: Math.max(MIN_H, maxH - 8), maximized: false, restore: undefined };
          }

          if (w.maximized) return { ...w, x: 0, y: MENUBAR_H, w: vw, h: vh - MENUBAR_H };

          const width = Math.max(MIN_W, Math.min(w.w, vw - 48));
          const height = Math.max(MIN_H, Math.min(w.h, maxH));
          return {
            ...w,
            w: width,
            h: height,
            // keep at least a grabbable strip of title bar on screen
            x: Math.min(Math.max(60 - width, w.x), vw - 60),
            y: Math.min(Math.max(MENUBAR_H, w.y), vh - 40),
          };
        }),
      };
    }),

  isRunning: (appId) => get().windows.some((w) => w.appId === appId),

  focusedId: () => {
    const vis = get().windows.filter((w) => !w.minimized);
    if (!vis.length) return null;
    return vis.reduce((a, b) => (a.z > b.z ? a : b)).id;
  },
}));

/* ────────────────────────────── system ────────────────────────────── */

export type Wallpaper = {
  id: string;
  name: string;
  css: string;
  dark: boolean;
  /** a photograph rather than a gradient — UI drawn over it needs a backing panel */
  photo?: boolean;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "sonoma",
    name: "Sonoma Night",
    dark: true,
    css: "var(--wp-sonoma)",
  },
  {
    id: "nika",
    name: "Gear 5",
    dark: true,
    photo: true,
    css: "var(--wp-nika)",
  },
  {
    id: "ventura",
    name: "Ventura Dusk",
    dark: true,
    css: "var(--wp-ventura)",
  },
  {
    id: "monterey",
    name: "Monterey",
    dark: true,
    css: "var(--wp-monterey)",
  },
  {
    id: "graphite",
    name: "Graphite",
    dark: true,
    css: "var(--wp-graphite)",
  },
  {
    id: "abyss",
    name: "Abyss",
    dark: true,
    css: "var(--wp-abyss)",
  },
  {
    id: "ember",
    name: "Ember",
    dark: true,
    css: "var(--wp-ember)",
  },
  {
    id: "sakura",
    name: "Sakura",
    dark: false,
    css: "var(--wp-sakura)",
  },
  {
    id: "daybreak",
    name: "Daybreak",
    dark: false,
    css: "var(--wp-daybreak)",
  },
  {
    id: "mint",
    name: "Mint",
    dark: false,
    css: "var(--wp-mint)",
  },
];

export type Toast = { id: number; app: string; title: string; body: string; emoji?: string };

export type Appearance = "dark" | "light";

type SystemStore = {
  booted: boolean;
  setBooted: (v: boolean) => void;

  appearance: Appearance;
  setAppearance: (v: Appearance) => void;

  wallpaperId: string;
  setWallpaper: (id: string) => void;
  wallpaper: () => Wallpaper;

  spotlight: boolean;
  setSpotlight: (v: boolean) => void;

  launchpad: boolean;
  setLaunchpad: (v: boolean) => void;

  missionControl: boolean;
  setMissionControl: (v: boolean) => void;

  shortcuts: boolean;
  setShortcuts: (v: boolean) => void;

  /** appId being previewed with Quick Look, or null */
  quickLook: string | null;
  setQuickLook: (v: string | null) => void;

  controlCentre: boolean;
  setControlCentre: (v: boolean) => void;

  activeMenu: string | null;
  setActiveMenu: (v: string | null) => void;

  toasts: Toast[];
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
};

let toastSeq = 0;

/**
 * Read back whatever the blocking script in <head> already applied, so the
 * store and the DOM agree from the first client render. On the server this
 * is always "dark"; no component that depends on it renders during
 * hydration, so there is nothing to mismatch.
 */
function initialAppearance(): Appearance {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-appearance") === "light" ? "light" : "dark";
}

function initialWallpaper(): string {
  if (typeof localStorage === "undefined") return "sonoma";
  try {
    const saved = localStorage.getItem("wallpaper");
    return WALLPAPERS.some((w) => w.id === saved) ? (saved as string) : "sonoma";
  } catch {
    return "sonoma";
  }
}

export const useSystem = create<SystemStore>((set, get) => ({
  booted: false,
  setBooted: (v) => set({ booted: v }),

  appearance: initialAppearance(),
  setAppearance: (v) => {
    document.documentElement.setAttribute("data-appearance", v);
    try {
      localStorage.setItem("appearance", v);
    } catch {
      /* private browsing — the choice just won't survive a reload */
    }
    set({ appearance: v });
  },

  wallpaperId: initialWallpaper(),
  setWallpaper: (id) => {
    // the gradient itself lives in CSS; <html> just names which one is active,
    // so server and client markup stay identical
    document.documentElement.setAttribute("data-wallpaper", id);
    try {
      localStorage.setItem("wallpaper", id);
    } catch {
      /* private browsing — the choice just won't survive a reload */
    }
    set({ wallpaperId: id });
  },
  wallpaper: () => WALLPAPERS.find((w) => w.id === get().wallpaperId) ?? WALLPAPERS[0],

  spotlight: false,
  setSpotlight: (v) => set({ spotlight: v, launchpad: false, missionControl: false }),

  launchpad: false,
  setLaunchpad: (v) => set({ launchpad: v, spotlight: false, missionControl: false }),

  missionControl: false,
  setMissionControl: (v) => set({ missionControl: v, spotlight: false, launchpad: false }),

  shortcuts: false,
  setShortcuts: (v) => set({ shortcuts: v }),

  quickLook: null,
  setQuickLook: (v) => set({ quickLook: v }),

  controlCentre: false,
  setControlCentre: (v) => set({ controlCentre: v }),

  activeMenu: null,
  setActiveMenu: (v) => set({ activeMenu: v }),

  toasts: [],
  notify: (t) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().dismiss(id), 5200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
