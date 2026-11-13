"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { APPS, appById } from "@/lib/apps";
import { LaunchpadIcon } from "@/components/Icons";
import { useSystem, useWindows } from "@/lib/store";

/* Labelled icons have to be smaller, or eighteen of them do not fit on a
   laptop screen at all. The tooltip still carries the full name, since the
   label itself truncates. */
const SIZES = {
  labelled: { base: 40, peak: 62, width: 60 },
  plain: { base: 50, peak: 80, width: 0 },
};
const RANGE = 130;

export default function Dock() {
  const mouseX = useMotionValue(Infinity);
  const windows = useWindows((s) => s.windows);
  const openApp = useWindows((s) => s.open);
  const restore = useWindows((s) => s.restore);
  const setLaunchpad = useSystem((s) => s.setLaunchpad);
  const labelled = useSystem((s) => s.dockLabels);
  const size = labelled ? SIZES.labelled : SIZES.plain;

  const minimized = windows.filter((w) => w.minimized);
  const pinned = APPS.filter((a) => a.dock);

  /* A phone shows no desktop icons and drops the link shortcuts, so most of
     the site sits behind one button. Count what is hidden and put the number
     on it — "Launchpad" alone tells a non-Mac visitor nothing. */
  const onPhoneDock = pinned.filter((a) => !a.href && !a.secondaryDock).length;
  const behindLaunchpad = APPS.length - onPhoneDock;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[8000] flex justify-center pb-2">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={`pointer-events-auto flex max-w-[calc(100vw-16px)] items-end gap-1.5 overflow-x-auto rounded-[20px] border border-white/14 px-2.5 pt-1.5 ${
          labelled ? "pb-2.5" : "pb-1.5"
        }`}
        style={{
          background: "rgba(255,255,255,.2)",
          backdropFilter: "blur(30px) saturate(185%)",
          WebkitBackdropFilter: "blur(30px) saturate(185%)",
          /* top specular, darkened sides — the Golden Gate lighting */
          boxShadow:
            "0 12px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.26), inset 1px 0 0 rgba(0,0,0,.14), inset -1px 0 0 rgba(0,0,0,.14)",
        }}
      >
        {/* phones lose the desktop icons and the link shortcuts, so this is
            the only way to the other apps — the badge says how many */}
        <div className="relative flex flex-col items-center sm:hidden">
          <DockItem
            mouseX={mouseX}
            label="All Apps"
            icon={<LaunchpadIcon />}
            running={false}
            size={size}
            onClick={() => setLaunchpad(true)}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute right-1 top-0 grid h-[17px] min-w-[17px] place-items-center rounded-full border border-white/25 bg-[#ff3b30] px-1 text-[10px] font-semibold leading-none text-white"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,.5)" }}
          >
            {behindLaunchpad}
          </span>
        </div>

        {pinned.map((app) => (
          <DockItem
            key={app.id}
            mouseX={mouseX}
            label={app.name}
            icon={app.icon}
            running={windows.some((w) => w.appId === app.id)}
            size={size}
            /* link shortcuts would overflow a phone dock; they live in About and Contact too */
            hideOnMobile={Boolean(app.href) || Boolean(app.secondaryDock)}
            onClick={() => {
              if (app.href) window.open(app.href, "_blank", "noopener,noreferrer");
              else openApp(app.id, { size: app.size });
            }}
          />
        ))}

        {minimized.length > 0 && <span className="mx-1 h-[44px] w-px self-center bg-white/22" />}

        <AnimatePresence>
          {minimized.map((w) => {
            const app = appById(w.appId);
            if (!app) return null;
            return (
              <motion.div key={w.id} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}>
                <DockItem mouseX={mouseX} label={app.name} caption="minimised" icon={app.icon} running size={size} onClick={() => restore(w.id)} dim />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function DockItem({
  mouseX,
  icon,
  label,
  running,
  onClick,
  dim,
  hideOnMobile,
  size,
  caption,
}: {
  mouseX: MotionValue<number>;
  icon: React.ReactNode;
  label: string;
  running: boolean;
  onClick: () => void;
  dim?: boolean;
  hideOnMobile?: boolean;
  size: { base: number; peak: number; width: number };
  caption?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return RANGE * 2;
    return v - (b.left + b.width / 2);
  });

  const sizeRaw = useTransform(distance, [-RANGE, 0, RANGE], [size.base, size.peak, size.base], { clamp: true });
  const px = useSpring(sizeRaw, { mass: 0.09, stiffness: 190, damping: 14 });

  return (
    <div
      className={`relative flex-col items-center ${hideOnMobile ? "hidden sm:flex" : "flex"}`}
      style={size.width > 0 ? { width: size.width } : undefined}
    >
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.13 }}
            className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-md border border-white/14 px-2 py-1 text-[12px] text-white"
            style={{ background: "var(--glass-panel)", backdropFilter: "blur(20px)" }}
          >
            {label}
            {caption && <span className="text-white/50"> — {caption}</span>}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        style={{ width: px, height: px }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          setBouncing(true);
          setTimeout(() => setBouncing(false), 2400);
          onClick();
        }}
        aria-label={label}
        className={`origin-bottom ${bouncing ? "dock-bounce" : ""} ${dim ? "opacity-75" : ""}`}
      >
        {icon}
      </motion.button>

      {size.width > 0 && (
        <span
          className="mt-[4px] w-full truncate text-center text-[9.5px] leading-[1.15] text-white [text-shadow:0_1px_2px_rgba(0,0,0,.85)]"
          style={{ maxWidth: size.width }}
        >
          {label}
        </span>
      )}

      <span
        className={`h-[3px] w-[3px] rounded-full bg-white/85 ${size.width > 0 ? "mt-[2px]" : "mt-[3px]"} ${
          running ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
