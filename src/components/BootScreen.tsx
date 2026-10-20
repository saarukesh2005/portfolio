"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { DevilFruit } from "@/components/Icons";

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onDone();
      return;
    }
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          setTimeout(onDone, 380);
          return 100;
        }
        return p + Math.random() * 14 + 5;
      });
    }, 130);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9900] flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <DevilFruit className="h-[72px] w-[72px]" />
      </motion.div>

      <div className="h-[5px] w-[188px] overflow-hidden rounded-full bg-white/18">
        <motion.div className="h-full rounded-full bg-white" animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ ease: "linear", duration: 0.13 }} />
      </div>
    </motion.div>
  );
}
