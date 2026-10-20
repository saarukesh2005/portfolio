"use client";

import { useState } from "react";
import Image from "next/image";
import { profile, skills, certifications, experience, education, volunteering, languages } from "@/content/profile";
import { socialGlyphs, Glyph, MiniIcon } from "@/components/Icons";

const SECTIONS = [
  { id: "about", label: "About Me", glyph: MiniIcon.person },
  { id: "skills", label: "Skills", glyph: MiniIcon.spark },
  { id: "certifications", label: "Certifications", glyph: MiniIcon.badge },
  { id: "experience", label: "Experience", glyph: MiniIcon.briefcase },
  { id: "education", label: "Education", glyph: MiniIcon.cap },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function AboutApp() {
  const [section, setSection] = useState<SectionId>("about");

  return (
    <div className="flex h-full">
      {/* Finder sidebar */}
      <nav
        className="hidden w-[186px] shrink-0 flex-col gap-0.5 overflow-y-auto p-2.5 sm:flex mac-scroll"
        style={{ background: "var(--win-sidebar)" }}
      >
        <p className="px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-lo">Profile</p>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-[6px] text-left text-[13px] transition-colors ${
              section === s.id ? "bg-[var(--accent)] text-white" : "text-mid hover:bg-[var(--fill-2)]"
            }`}
          >
            <span className="h-[15px] w-[15px] shrink-0 opacity-90">{s.glyph}</span>
            {s.label}
          </button>
        ))}

        <p className="px-2.5 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-wider text-lo">Links</p>
        {profile.socials.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-[6px] text-[13px] text-mid transition-colors hover:bg-[var(--fill-2)]"
          >
            <span className="h-4 w-4 shrink-0">{socialGlyphs[s.icon]}</span>
            <span className="truncate">{s.label}</span>
          </a>
        ))}
      </nav>

      {/* content */}
      <div className="mac-scroll flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        {/* mobile section switcher */}
        <div className="mb-5 flex gap-1.5 overflow-x-auto sm:hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] ${
                section === s.id ? "bg-[var(--accent)] text-white" : "bg-[var(--fill-2)] text-mid"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "about" && <AboutSection />}
        {section === "skills" && <SkillsSection />}
        {section === "certifications" && <CertificationsSection />}
        {section === "experience" && <ExperienceSection />}
        {section === "education" && <EducationSection />}
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="max-w-[58ch]">
      <div className="mb-7 flex items-center gap-5">
        <Avatar />
        <div className="min-w-0">
          <h1 className="truncate text-[26px] font-semibold leading-tight tracking-[-0.02em]">{profile.name}</h1>
          <p className="text-[14px] text-mid">{profile.role}</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-lo">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_#34d399]" />
            {profile.location} · open to work
          </p>
        </div>
      </div>

      <p className="mb-6 text-[15px] leading-relaxed text-mid">{profile.tagline}</p>

      <div className="space-y-4">
        {profile.bio.map((p, i) => (
          <p key={i} className="text-[14px] leading-[1.75] text-mid">
            {p}
          </p>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {profile.socials.map((s) => (
          <a
            key={s.label}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group flex items-center gap-2.5 rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-3 py-2.5 transition-colors hover:bg-[var(--fill-2)]"
          >
            <span className="h-6 w-6 shrink-0">{socialGlyphs[s.icon]}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">{s.label}</span>
            </span>
            <span className="text-lo opacity-0 transition-opacity group-hover:opacity-100">{Glyph.external}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Avatar() {
  const [failed, setFailed] = useState(false);
  const initials = profile.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  if (!profile.avatar || failed) {
    return (
      <div className="grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-[30px] font-semibold text-white shadow-lg">
        {initials}
      </div>
    );
  }
  return (
    <Image
      src={profile.avatar}
      alt={profile.name}
      width={86}
      height={86}
      onError={() => setFailed(true)}
      className="h-[86px] w-[86px] shrink-0 rounded-full object-cover shadow-lg ring-1 ring-white/20"
    />
  );
}

function SkillsSection() {
  const groups = [...new Set(skills.map((s) => s.group))];
  return (
    <div className="max-w-[58ch]">
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">Skills</h2>
      <div className="space-y-7">
        {groups.map((g) => (
          <section key={g}>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-lo">{g}</h3>
            <div className="flex flex-wrap gap-2">
              {skills
                .filter((s) => s.group === g)
                .map((s) => (
                  <span
                    key={s.name}
                    className="rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2.5 py-1.5 text-[13px]"
                  >
                    {s.name}
                  </span>
                ))}
            </div>
          </section>
        ))}
      </div>

      <h2 className="mb-4 mt-9 text-[22px] font-semibold tracking-[-0.02em]">Languages</h2>
      <div className="flex flex-wrap gap-2">
        {languages.map((l) => (
          <span
            key={l}
            className="rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-2.5 py-1.5 text-[13px]"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection() {
  return (
    <div className="max-w-[62ch]">
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">Certifications</h2>
      <div className="space-y-3">
        {certifications.map((c) => (
          <div key={c.name} className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-[14.5px] font-semibold">{c.name}</h3>
              {c.period && <span className="font-mono text-[11.5px] text-lo">{c.period}</span>}
            </div>
            <p className="text-[13px] text-mid">{c.issuer}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md px-2 py-[2px] text-[11.5px] ${
                  c.status === "Completed"
                    ? "bg-emerald-500/18 text-emerald-400"
                    : c.status === "In progress"
                      ? "bg-sky-500/18 text-sky-400"
                      : "bg-amber-500/18 text-amber-400"
                }`}
              >
                {c.status}
              </span>
              {c.detail && <span className="text-[13px] text-mid">{c.detail}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExperienceSection() {
  return (
    <div className="max-w-[62ch]">
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">Experience</h2>
      <ol className="relative space-y-8 border-l border-[var(--glass-stroke)] pl-6">
        {experience.map((job) => (
          <li key={job.role + job.company} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--win-bg)]" />
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-[15px] font-semibold">{job.role}</h3>
              <span className="font-mono text-[11.5px] text-lo">{job.period}</span>
            </div>
            <p className="mb-2.5 text-[13px] text-mid">
              {job.company} · {job.location}
            </p>
            <ul className="space-y-1.5">
              {job.points.map((p, i) => (
                <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-mid">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
                  {p}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EducationSection() {
  return (
    <div className="max-w-[62ch]">
      <h2 className="mb-6 text-[22px] font-semibold tracking-[-0.02em]">Education</h2>
      <div className="space-y-4">
        {education.map((e) => (
          <div key={e.degree} className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-[15px] font-semibold">{e.degree}</h3>
              <span className="font-mono text-[11.5px] text-lo">{e.period}</span>
            </div>
            <p className="text-[13px] text-mid">{e.school}</p>
            {e.detail && <p className="mt-2 text-[13px] leading-relaxed text-mid">{e.detail}</p>}
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-9 text-[22px] font-semibold tracking-[-0.02em]">Volunteering</h2>
      <div className="space-y-3">
        {volunteering.map((v) => (
          <div key={v.org} className="rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-[14.5px] font-semibold">{v.org}</h3>
              {v.period && <span className="font-mono text-[11.5px] text-lo">{v.period}</span>}
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-mid">{v.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
