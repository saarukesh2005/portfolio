"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import BootScreen from "@/components/BootScreen";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import DesktopIcons from "@/components/DesktopIcons";
import Window from "@/components/Window";
import Spotlight from "@/components/Spotlight";
import ContextMenu from "@/components/ContextMenu";
import Notifications from "@/components/Notifications";
import Launchpad from "@/components/Launchpad";
import MissionControl from "@/components/MissionControl";
import Shortcuts from "@/components/Shortcuts";
import QuickLook from "@/components/QuickLook";
import ControlCentre from "@/components/ControlCentre";
import { useSystem, useWindows } from "@/lib/store";
import { profile } from "@/content/profile";

export default function Desktop() {
  const booted = useSystem((s) => s.booted);
  const setBooted = useSystem((s) => s.setBooted);
  const notify = useSystem((s) => s.notify);

  const windows = useWindows((s) => s.windows);
  const focusedId = useWindows((s) => s.focusedId());
  const openApp = useWindows((s) => s.open);
  const reflow = useWindows((s) => s.reflow);

  /*
   * Skip the boot animation if this tab has already seen it. Deferred to the
   * next frame on purpose: the server always renders the un-booted markup, so
   * flipping this during hydration would mismatch.
   */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        if (sessionStorage.getItem("booted") === "1") setBooted(true);
      } catch {
        /* private mode — just play the boot animation */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [setBooted]);

  // StrictMode mounts effects twice in dev; the welcome sequence must not double up
  const greeted = useRef(false);

  /* keep windows inside the viewport when it changes size or orientation */
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => reflow(window.innerWidth, window.innerHeight));
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, [reflow]);

  /* ⌘` cycles windows, the way it does on a Mac. Minimised windows are
     skipped — bringing back something the user put away is not cycling. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "`") return;
      const open = useWindows.getState().windows.filter((w) => !w.minimized);
      if (open.length < 2) return;
      e.preventDefault();
      const order = [...open].sort((a, b) => a.z - b.z);
      const step = e.shiftKey ? -1 : 1;
      const here = order.findIndex((w) => w.id === useWindows.getState().focusedId());
      const next = order[(here + step + order.length) % order.length];
      useWindows.getState().focus(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const finishBoot = useCallback(() => {
    setBooted(true);
    if (greeted.current) return;
    greeted.current = true;
    try {
      sessionStorage.setItem("booted", "1");
    } catch {}

    const mobile = window.innerWidth < 760;
    setTimeout(() => openApp("about", { size: { w: 840, h: 560 } }), 420);
    setTimeout(
      () =>
        notify({
          app: "Finder",
          emoji: "👋",
          title: `Hey, I'm ${profile.name.split(" ")[0]}`,
          body: mobile
            ? "Tap the dock below to open apps."
            : "Double-click the desktop icons, or press ⌘K to search. Try the Terminal.",
        }),
      1500
    );
  }, [notify, openApp, setBooted]);

  return (
    <main
      data-desktop-surface
      data-print-hide
      className="relative h-[100dvh] w-screen overflow-hidden"
      style={{ backgroundImage: "var(--wallpaper)", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* subtle vignette so the chrome reads against any wallpaper */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,.35) 100%)" }}
      />

      <AnimatePresence>{!booted && <BootScreen key="boot" onDone={finishBoot} />}</AnimatePresence>

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }} className="h-full w-full">
          <MenuBar />
          <DesktopIcons />

          {/* windows */}
          <AnimatePresence>
            {windows.filter((w) => !w.minimized).map((w) => (
              <Window key={w.id} win={w} active={w.id === focusedId} />
            ))}
          </AnimatePresence>

          <Dock />
          <Spotlight />
          <Launchpad />
          <MissionControl />
          <Shortcuts />
          <QuickLook />
          <ControlCentre />
          <ContextMenu />
          <Notifications />

          {/* when every window is closed, nudge rather than leave a blank desktop */}
          {windows.length === 0 && <EmptyHint />}
        </motion.div>
      )}
    </main>
  );
}

function EmptyHint() {
  const setSpotlight = useSystem((s) => s.setSpotlight);
  const openApp = useWindows((s) => s.open);
  // a gradient wallpaper reads fine behind plain text; a photo does not
  const photo = useSystem((s) => s.wallpaper().photo ?? false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="pointer-events-none absolute inset-0 z-[5] grid place-items-center px-6 text-center"
    >
      <div
        className={`pointer-events-auto ${photo ? "rounded-[28px] border border-white/14 px-8 py-7 sm:px-12 sm:py-8" : ""}`}
        style={
          photo
            ? {
                background: "rgba(6,8,14,.44)",
                backdropFilter: "blur(22px) saturate(140%)",
                WebkitBackdropFilter: "blur(22px) saturate(140%)",
              }
            : undefined
        }
      >
        <h1
          className="text-[34px] font-semibold tracking-[-0.03em] text-[var(--chrome-text)] sm:text-[44px]"
          style={{ textShadow: "var(--chrome-shadow)" }}
        >
          {profile.name}
        </h1>
        <p className="mt-1.5 text-[15px] text-[var(--chrome-dim)]" style={{ textShadow: "var(--chrome-shadow)" }}>
          {profile.role}
        </p>

        {/* A visitor who does not explore sees nothing but a wallpaper and
            leaves. Point them at the strongest thing here, by name, rather
            than hoping they go looking for it. */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={() => openApp("analyser", { size: { w: 960, h: 680 } })}
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            Open Ratio Analyser — drop in a balance sheet →
          </button>
          <button
            onClick={() => setSpotlight(true)}
            className="rounded-full px-3 py-1 text-[12.5px] text-[var(--chrome-dim)] transition-opacity hover:opacity-100"
          >
            <span className="hidden sm:inline">
              or press <kbd className="font-mono">⌘K</kbd> to search everything
            </span>
            <span className="sm:hidden">or browse the dock below</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
