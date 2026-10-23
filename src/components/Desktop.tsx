"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import BootScreen from "@/components/BootScreen";
import MenuBar from "@/components/MenuBar";
import Dock from "@/components/Dock";
import DesktopIcons from "@/components/DesktopIcons";
import VerseToast from "@/components/VerseToast";
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
          <VerseToast />

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
        <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-white [text-shadow:0_2px_20px_rgba(0,0,0,.6)] sm:text-[44px]">
          {profile.name}
        </h1>
        <p className="mt-1.5 text-[15px] text-white/75 [text-shadow:0_1px_10px_rgba(0,0,0,.6)]">{profile.role}</p>
        <button
          onClick={() => setSpotlight(true)}
          className="mt-6 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-[13px] text-white backdrop-blur-xl transition-colors hover:bg-white/20"
        >
          <span className="hidden sm:inline">
            Press <kbd className="font-mono">⌘K</kbd> to search — or click the dock
          </span>
          <span className="sm:hidden">Tap an app in the dock to start</span>
        </button>
      </div>
    </motion.div>
  );
}
