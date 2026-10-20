"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { APPS, appById } from "@/lib/apps";
import { LaunchpadIcon } from "@/components/Icons";
import { useSystem, useWindows } from "@/lib/store";

const BASE = 50;
const PEAK = 80;
const RANGE = 130;

export default function Dock() {
  const mouseX = useMotionValue(Infinity);
  const windows = useWindows((s) => s.windows);
  const openApp = useWindows((s) => s.open);
  const restore = useWindows((s) => s.restore);
  const setLaunchpad = useSystem((s) => s.setLaunchpad);

  const minimized = windows.filter((w) => w.minimized);
  const pinned = APPS.filter((a) => a.dock);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[8000] flex justify-center pb-2">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex max-w-[calc(100vw-16px)] items-end gap-1.5 overflow-x-auto rounded-[20px] border border-white/14 px-2.5 pb-1.5 pt-1.5"
        style={{
          background: "rgba(255,255,255,.14)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          boxShadow: "0 12px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.22)",
        }}
      >
        {/* phones lose the secondary apps below, so Launchpad is how you reach them */}
        <div className="flex flex-col items-center sm:hidden">
          <DockItem
            mouseX={mouseX}
            label="Launchpad"
            icon={<LaunchpadIcon />}
            running={false}
            onClick={() => setLaunchpad(true)}
          />
        </div>

        {pinned.map((app) => (
          <DockItem
            key={app.id}
            mouseX={mouseX}
            label={app.name}
            icon={app.icon}
            running={windows.some((w) => w.appId === app.id)}
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
                <DockItem mouseX={mouseX} label={`${app.name} — minimised`} icon={app.icon} running onClick={() => restore(w.id)} dim />
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
}: {
  mouseX: MotionValue<number>;
  icon: React.ReactNode;
  label: string;
  running: boolean;
  onClick: () => void;
  dim?: boolean;
  hideOnMobile?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  const distance = useTransform(mouseX, (v) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b) return RANGE * 2;
    return v - (b.left + b.width / 2);
  });

  const sizeRaw = useTransform(distance, [-RANGE, 0, RANGE], [BASE, PEAK, BASE], { clamp: true });
  const size = useSpring(sizeRaw, { mass: 0.09, stiffness: 190, damping: 14 });

  return (
    <div className={`relative flex-col items-center ${hideOnMobile ? "hidden sm:flex" : "flex"}`}>
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            transition={{ duration: 0.13 }}
            className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/14 px-2 py-1 text-[12px] text-white"
            style={{ background: "rgba(40,42,50,.9)", backdropFilter: "blur(20px)" }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        ref={ref}
        style={{ width: size, height: size }}
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

      <span className={`mt-[3px] h-[3px] w-[3px] rounded-full bg-white/85 ${running ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}
