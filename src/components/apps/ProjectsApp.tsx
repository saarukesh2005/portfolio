"use client";

import { useState } from "react";
import Image from "next/image";
import { projects, type Project } from "@/content/profile";
import { Glyph } from "@/components/Icons";

export default function ProjectsApp({ payload }: { payload?: unknown }) {
  const initial = (payload as { projectId?: string })?.projectId;
  const [openId, setOpenId] = useState<string | null>(initial ?? null);
  const [filter, setFilter] = useState<string>("All");

  const selected = projects.find((p) => p.id === openId);
  const allTags = ["All", ...new Set(projects.flatMap((p) => p.tags))];
  const shown = filter === "All" ? projects : projects.filter((p) => p.tags.includes(filter));

  if (selected) return <Detail project={selected} onBack={() => setOpenId(null)} />;

  return (
    <div className="mac-scroll h-full overflow-y-auto">
      {allTags.length > 2 && (<div className="sticky top-0 z-10 flex gap-1.5 overflow-x-auto border-b border-[var(--glass-stroke)] px-5 py-2.5"
        style={{ background: "var(--win-bg)" }}>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[12px] transition-colors ${
              filter === t ? "bg-[var(--accent)] text-white" : "bg-[var(--fill-2)] text-mid hover:bg-[var(--fill-3)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>)}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        {shown.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpenId(p.id)}
            className="group overflow-hidden rounded-2xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] text-left transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--fill-2)] hover:shadow-xl"
          >
            <Thumb project={p} className="h-[132px]" />
            <div className="p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="truncate text-[14.5px] font-semibold">{p.name}</h3>
                <span className="shrink-0 font-mono text-[11px] text-lo">{p.year}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-mid">{p.blurb}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-md bg-[var(--fill-2)] px-1.5 py-0.5 font-mono text-[10.5px] text-mid">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="p-10 text-center text-[13px] text-lo">No projects tagged “{filter}”.</p>}
    </div>
  );
}

function Thumb({ project, className = "" }: { project: Project; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (project.image && !failed) {
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <Image
          src={project.image}
          alt={project.name}
          fill
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }
  return (
    <div className={`grid w-full place-items-center bg-gradient-to-br ${project.accent} ${className}`}>
      <span className="text-[40px] drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{project.emoji}</span>
    </div>
  );
}

function Detail({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div className="mac-scroll h-full overflow-y-auto">
      <div
        className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--glass-stroke)] px-4 py-2"
        style={{ background: "var(--win-bg)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[13px] text-[var(--accent)] transition-colors hover:bg-[var(--fill-2)]"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m14.5 5-7 7 7 7" />
          </svg>
          Projects
        </button>
      </div>

      <Thumb project={project} className="h-[190px]" />

      <div className="max-w-[62ch] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{project.name}</h1>
          <span className="font-mono text-[12px] text-lo">{project.year}</span>
        </div>
        <p className="mt-1.5 text-[14px] text-mid">{project.blurb}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span key={t} className="rounded-md bg-[var(--fill-2)] px-2 py-[3px] font-mono text-[11px] text-mid">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-3.5">
          {project.description.map((d, i) => (
            <p key={i} className="text-[14px] leading-[1.75] text-mid">
              {d}
            </p>
          ))}
        </div>

        {project.privateRepo && (
          <p className="mt-6 rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-1)] px-3 py-2.5 text-[12.5px] leading-relaxed text-mid">
            Source is in a private repository. Happy to walk through the code or the design
            decisions on request.
          </p>
        )}

        {(project.live || project.repo) && (
          <div className="mt-7 flex flex-wrap gap-2.5">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-88"
              >
                Live site {Glyph.external}
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1.5 rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-2)] px-3.5 py-2 text-[13px] font-medium transition-colors hover:bg-[var(--fill-3)]"
              >
                Source {Glyph.external}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
