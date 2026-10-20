"use client";

import { profile, skills, certifications } from "@/content/profile";
import { ShipIcon, Glyph } from "@/components/Icons";
import { useWindows } from "@/lib/store";

type Opening = { title: string; who: string; detail: string; emoji: string };

const OPENINGS: Opening[] = [
  {
    emoji: "💼",
    title: "A seat on a real crew",
    who: "Recruiters & hiring managers",
    detail:
      "I'm looking for my first full-time role in financial services — equity research, financial analysis, fund accounting, or anything where reading a balance sheet carefully is the job.",
  },
  {
    emoji: "📚",
    title: "Study partners",
    who: "CMA & NISM candidates",
    detail:
      "I'm preparing for NISM Series XV and waiting on CMA Intermediate Group 1. If you're on the same stretch of the route, comparing notes beats doing it alone.",
  },
  {
    emoji: "📈",
    title: "Research partners",
    who: "Anyone who likes pulling annual reports apart",
    detail:
      "I did five years of Bharat Dynamics ratio by ratio for my final-year project and want to keep doing it. Pick a listed company, split the work, compare conclusions.",
  },
  {
    emoji: "🛠️",
    title: "Something you're building",
    who: "Founders & student teams",
    detail:
      "If you're building in fintech, accounting or anything finance-adjacent and need someone who can read the numbers, I'd like to hear about it.",
  },
];

export default function CrewApp() {
  const openApp = useWindows((s) => s.open);

  const brings = [
    ...certifications.filter((c) => c.status === "Completed").map((c) => c.name),
    ...skills.filter((s) => s.group === "Finance").map((s) => s.name),
  ];

  return (
    <div className="mac-scroll h-full overflow-y-auto">
      {/* hero */}
      <div
        className="flex flex-col items-center px-6 pb-7 pt-9 text-center"
        style={{ background: "linear-gradient(180deg, color-mix(in srgb, #1264c0 22%, transparent), transparent)" }}
      >
        <span className="h-[72px] w-[72px] drop-shadow-lg">
          <ShipIcon />
        </span>
        <h1 className="mt-4 text-[26px] font-semibold tracking-[-0.02em]">Join my Crew</h1>
        <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-mid">
          Nobody gets anywhere on the Grand Line alone. If any of these sound like you, I&rsquo;d genuinely
          like to hear from you &mdash; whether you&rsquo;re hiring, studying the same papers, or
          building something that needs a finance brain.
        </p>
      </div>

      {/* openings */}
      <div className="grid grid-cols-1 gap-3 px-5 pb-2 sm:grid-cols-2">
        {OPENINGS.map((o) => (
          <section
            key={o.title}
            className="rounded-2xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4"
          >
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--fill-2)] text-[16px]">
                {o.emoji}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold">{o.title}</span>
                <span className="block truncate text-[11.5px] text-lo">{o.who}</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-mid">{o.detail}</p>
          </section>
        ))}
      </div>

      {/* what I bring */}
      <div className="px-5 pt-5">
        <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-lo">
          What I bring aboard
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {brings.map((b) => (
            <span
              key={b}
              className="rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2.5 py-1.5 text-[12.5px]"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* call to action */}
      <div className="flex flex-wrap items-center gap-2.5 p-5">
        <button
          onClick={() => openApp("mail", { size: { w: 720, h: 540 } })}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-88"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m3.5 11.8 17-7.3-7.3 17-2.1-7.6z" />
          </svg>
          Send me a message
        </button>

        {profile.socials
          .filter((s) => s.icon === "linkedin")
          .map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-2)] px-4 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[var(--fill-3)]"
            >
              Connect on LinkedIn {Glyph.external}
            </a>
          ))}
      </div>

      <p className="px-5 pb-6 text-[11.5px] text-lo">
        Based in {profile.location} · open to remote and relocation.
      </p>
    </div>
  );
}
