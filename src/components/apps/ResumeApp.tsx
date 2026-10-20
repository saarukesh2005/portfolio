"use client";

import { useState } from "react";
import {
  profile,
  skills,
  certifications,
  projects,
  experience,
  education,
  volunteering,
  languages,
  resumeFile,
} from "@/content/profile";

export default function ResumeApp() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex h-full flex-col">
      {/* Preview-style toolbar */}
      <div
        className="flex shrink-0 items-center gap-2 border-b border-[var(--glass-stroke)] px-3 py-2"
        style={{ background: "var(--win-chrome)" }}
      >
        <div className="flex items-center overflow-hidden rounded-md border border-[var(--glass-stroke)]">
          <button onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))} className="px-2.5 py-1 text-[13px] text-mid hover:bg-[var(--fill-2)]" aria-label="Zoom out">−</button>
          <span className="w-[46px] border-x border-[var(--glass-stroke)] py-1 text-center font-mono text-[11px] text-mid">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))} className="px-2.5 py-1 text-[13px] text-mid hover:bg-[var(--fill-2)]" aria-label="Zoom in">+</button>
        </div>
        <span className="truncate font-mono text-[11.5px] text-lo">
          {resumeFile.replace(/^\//, "")}
        </span>
        <a
          href={resumeFile}
          download
          className="ml-auto shrink-0 rounded-md bg-[var(--accent)] px-3 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-88"
        >
          Download {resumeFile.split(".").pop()?.toUpperCase()}
        </a>
      </div>

      {/* paper */}
      <div className="mac-scroll flex-1 overflow-auto bg-black/25 p-5">
        <div
          data-print-sheet
          className="mx-auto w-[640px] max-w-full origin-top rounded-sm bg-white p-10 text-[#16181d] shadow-2xl"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <header className="border-b-2 border-[#16181d] pb-3">
            <h1 className="text-[27px] font-bold leading-tight tracking-[-0.02em]">{profile.name}</h1>
            <p className="mt-0.5 text-[13.5px] font-medium text-[#4a5160]">{profile.role}</p>
            <p className="mt-2 text-[11.5px] text-[#5a6272]">
              {[
                profile.location,
                profile.phone,
                profile.email,
                ...profile.socials
                  .filter((s) => s.icon !== "mail")
                  .map((s) => s.url.replace(/^https?:\/\/(www\.)?/, "")),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </header>

          <Section title="Professional Summary">
            <p className="text-[12.5px] leading-[1.65] text-[#333a46]">
              {profile.bio.join(" ")}
            </p>
          </Section>

          <Section title="Education">
            {education.map((e) => (
              <div key={e.degree} className="mb-2.5 last:mb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13px] font-bold">{e.degree}</h3>
                  <span className="shrink-0 text-[11px] text-[#5a6272]">{e.period}</span>
                </div>
                <p className="text-[12.5px] text-[#333a46]">
                  {e.school}
                  {e.detail ? ` · ${e.detail}` : ""}
                </p>
              </div>
            ))}
          </Section>

          <Section title="Certifications">
            <ul className="space-y-1 pl-4">
              {certifications.map((c) => (
                <li key={c.name} className="list-disc text-[12.5px] leading-[1.6] text-[#333a46]">
                  <span className="font-bold">{c.name}</span> ({c.issuer})
                  {c.period ? ` — ${c.period}` : ""} · {c.status}
                  {c.detail ? ` — ${c.detail}` : ""}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Key Project">
            {projects.map((pr) => (
              <div key={pr.id} className="mb-3 last:mb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13px] font-bold">{pr.name}</h3>
                  <span className="shrink-0 text-[11px] text-[#5a6272]">{pr.year}</span>
                </div>
                <ul className="mt-1 space-y-1 pl-4">
                  {pr.description.map((d, i) => (
                    <li key={i} className="list-disc text-[12.5px] leading-[1.6] text-[#333a46]">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Section>

          <Section title="Professional Experience">
            <div className="space-y-4">
              {experience.map((j) => (
                <div key={j.role + j.company}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[13px] font-bold">
                      {j.role} <span className="font-normal text-[#5a6272]">· {j.company}</span>
                    </h3>
                    <span className="shrink-0 text-[11px] text-[#5a6272]">{j.period}</span>
                  </div>
                  <ul className="mt-1 space-y-1 pl-4">
                    {j.points.map((pt, i) => (
                      <li key={i} className="list-disc text-[12.5px] leading-[1.6] text-[#333a46]">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Skills">
            <div className="space-y-1.5">
              {[...new Set(skills.map((sk) => sk.group))].map((g) => (
                <p key={g} className="text-[12.5px] text-[#333a46]">
                  <span className="font-bold">{g}: </span>
                  {skills.filter((sk) => sk.group === g).map((sk) => sk.name).join(" • ")}
                </p>
              ))}
            </div>
          </Section>

          <Section title="Volunteering & Languages">
            <ul className="space-y-1 pl-4">
              {volunteering.map((v) => (
                <li key={v.org} className="list-disc text-[12.5px] leading-[1.6] text-[#333a46]">
                  <span className="font-bold">{v.org}</span>
                  {v.period ? ` | ${v.period}` : ""} — {v.detail}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[12.5px] text-[#333a46]">
              <span className="font-bold">Languages: </span>
              {languages.join(" • ")}
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#5a6272]">{title}</h2>
      {children}
    </section>
  );
}
