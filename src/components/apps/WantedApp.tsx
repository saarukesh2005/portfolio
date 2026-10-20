"use client";

import { useState } from "react";
import Image from "next/image";
import { profile, certifications, skills } from "@/content/profile";
import { LuffyIcon } from "@/components/Icons";

/**
 * A One Piece bounty poster built from the real résumé data.
 * Deliberately kept to one window you have to go looking for — it is the
 * personality, not the pitch.
 */
export default function WantedApp() {
  const [failed, setFailed] = useState(false);

  const knownFor = [
    ...certifications.filter((c) => c.status === "Completed").map((c) => c.name),
    ...skills.filter((s) => s.group === "Finance").map((s) => s.name),
  ].slice(0, 5);

  const initials = profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <div className="mac-scroll h-full overflow-y-auto bg-[#2a211a] p-5">
      <div
        className="mx-auto w-[400px] max-w-full px-7 pb-6 pt-5 text-[#3c2a16] shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, #f2e2bf 0%, #e5d0a6 55%, #d4ba86 100%)",
          border: "3px solid #6b4f2a",
          boxShadow: "0 0 0 1px #3c2a16, 0 24px 60px rgba(0,0,0,.55), inset 0 0 70px rgba(107,79,42,.3)",
        }}
      >
        <p
          className="text-center font-bold leading-none tracking-[0.1em]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 54 }}
        >
          WANTED
        </p>

        <div
          className="mx-auto mt-3 grid h-[182px] w-full place-items-center overflow-hidden"
          style={{ border: "2px solid #6b4f2a", background: "rgba(255,255,255,.22)" }}
        >
          {profile.avatar && !failed ? (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={360}
              height={182}
              onError={() => setFailed(true)}
              className="h-full w-full object-cover"
              style={{ filter: "sepia(.55) contrast(1.05)" }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="h-[84px] w-[84px]">
                <LuffyIcon />
              </span>
              <span className="font-mono text-[11px] tracking-wide text-[#6b4f2a]">
                {profile.avatar ? "portrait unavailable" : `add public/avatar.jpg — showing ${initials}`}
              </span>
            </div>
          )}
        </div>

        <p
          className="mt-3 text-center font-bold uppercase leading-tight"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 30, letterSpacing: "0.02em" }}
        >
          {profile.name}
        </p>

        <p
          className="mt-0.5 text-center font-bold tracking-[0.22em]"
          style={{ fontFamily: "Georgia, serif", fontSize: 13 }}
        >
          DEAD OR ALIVE
        </p>

        <div className="my-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-[#6b4f2a]/50" />
          <span className="font-mono text-[10.5px] tracking-widest text-[#6b4f2a]">KNOWN FOR</span>
          <span className="h-px flex-1 bg-[#6b4f2a]/50" />
        </div>

        <ul className="space-y-1">
          {knownFor.map((k) => (
            <li key={k} className="text-center text-[12.5px] leading-snug" style={{ fontFamily: "Georgia, serif" }}>
              {k}
            </li>
          ))}
        </ul>

        <p
          className="mt-4 text-center font-bold leading-none"
          style={{ fontFamily: "Georgia, serif", fontSize: 26 }}
        >
          <span style={{ fontSize: 20 }}>₿</span> 5,98,00,000<span style={{ fontSize: 15 }}>-</span>
        </p>

        <p className="mt-3 text-center font-mono text-[10px] leading-relaxed tracking-wide text-[#6b4f2a]">
          {profile.location.toUpperCase()} · {profile.email}
          <br />
          MARINE HQ · GRAND LINE DIVISION
        </p>
      </div>

      <p className="mx-auto mt-4 max-w-[400px] text-center text-[11.5px] leading-relaxed text-white/40">
        For fun. Everything factual lives in About, Résumé and Projects.
      </p>
    </div>
  );
}
