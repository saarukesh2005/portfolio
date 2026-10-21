"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { publishedResearch, readingTime, type ResearchNote } from "@/content/research";
import { profile } from "@/content/profile";
import { Glyph } from "@/components/Icons";

const longDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Markdown styled for a research note — tables right-align their figures. */
const COMPONENTS = {
  h1: (p: object) => <h2 className="mt-7 text-[19px] font-semibold tracking-[-0.01em] first:mt-0" {...p} />,
  h2: (p: object) => <h2 className="mt-7 text-[17px] font-semibold tracking-[-0.01em] first:mt-0" {...p} />,
  h3: (p: object) => <h3 className="mt-5 text-[14.5px] font-semibold" {...p} />,
  p: (p: object) => <p className="mt-3 text-[14px] leading-[1.8] text-mid" {...p} />,
  ul: (p: object) => <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14px] leading-[1.7] text-mid" {...p} />,
  ol: (p: object) => <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] leading-[1.7] text-mid" {...p} />,
  li: (p: object) => <li className="pl-1" {...p} />,
  strong: (p: object) => <strong className="font-semibold text-[var(--text-hi)]" {...p} />,
  a: (p: object) => (
    <a className="text-[var(--accent)] underline underline-offset-2" target="_blank" rel="noreferrer noopener" {...p} />
  ),
  blockquote: (p: object) => (
    <blockquote
      className="mt-4 border-l-2 border-[var(--accent)] bg-[var(--fill-1)] px-4 py-2.5 text-[13.5px] leading-relaxed text-mid [&>p]:mt-0"
      {...p}
    />
  ),
  hr: () => <hr className="my-6 border-0 border-t border-[var(--glass-stroke)]" />,
  code: (p: object) => <code className="rounded bg-[var(--fill-2)] px-1 py-[1px] font-mono text-[12.5px]" {...p} />,
  table: (p: object) => (
    <div className="mac-scroll mt-4 overflow-x-auto rounded-xl border border-[var(--glass-stroke)]">
      <table className="w-full border-collapse text-[13px]" {...p} />
    </div>
  ),
  thead: (p: object) => <thead style={{ background: "var(--fill-2)" }} {...p} />,
  th: (p: object) => <th className="border-b border-[var(--glass-stroke)] px-3 py-2 text-left font-semibold last:text-right" {...p} />,
  td: (p: object) => (
    <td className="border-b border-[var(--glass-stroke)] px-3 py-2 text-mid tabular-nums last:text-right" {...p} />
  ),
};

export default function ResearchApp() {
  const notes = useMemo(() => publishedResearch(), []);
  const [slug, setSlug] = useState<string | null>(null);
  const open = notes.find((n) => n.slug === slug);

  if (notes.length === 0) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div className="max-w-[44ch]">
          <span className="mb-3 block text-[34px]">📝</span>
          <h2 className="mb-2 text-[16px] font-semibold">Nothing published yet</h2>
          <p className="text-[13px] leading-relaxed text-mid">
            Equity research notes go here — the write-ups where the reasoning is the point, not
            just the conclusion.
          </p>
        </div>
      </div>
    );
  }

  if (open) return <Note note={open} onBack={() => setSlug(null)} />;

  return (
    <div className="@container mac-scroll h-full overflow-y-auto">
      <header className="px-6 pb-2 pt-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Research</h1>
        <p className="mt-1 max-w-[52ch] text-[13.5px] leading-relaxed text-mid">
          Company write-ups and notes. Analysis and reasoning — not recommendations.
        </p>
      </header>

      <div className="space-y-2.5 p-5 pt-3">
        {notes.map((n) => (
          <button
            key={n.slug}
            onClick={() => setSlug(n.slug)}
            className="group block w-full rounded-2xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4 text-left transition-colors hover:bg-[var(--fill-2)]"
          >
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-lo">{longDate(n.date)}</span>
              {n.ticker && (
                <span className="rounded bg-[var(--fill-2)] px-1.5 py-[1px] font-mono text-[10.5px] text-mid">
                  {n.ticker}
                </span>
              )}
              {n.draft && (
                <span className="rounded bg-amber-500/18 px-1.5 py-[1px] text-[10.5px] text-amber-400">draft</span>
              )}
            </div>

            <h2 className="mt-1.5 text-[16px] font-semibold leading-snug">{n.title}</h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-mid">{n.summary}</p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {n.tags.map((t) => (
                <span key={t} className="rounded-md bg-[var(--fill-2)] px-2 py-[3px] font-mono text-[10.5px] text-mid">
                  {t}
                </span>
              ))}
              <span className="ml-auto text-[11.5px] text-lo">{readingTime(n.body)} min read</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Note({ note, onBack }: { note: ResearchNote; onBack: () => void }) {
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
          Research
        </button>
      </div>

      <article className="mx-auto max-w-[66ch] px-6 pb-10 pt-6">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-lo">{longDate(note.date)}</p>
          {note.ticker && (
            <span className="rounded bg-[var(--fill-2)] px-1.5 py-[1px] font-mono text-[10.5px] text-mid">{note.ticker}</span>
          )}
          {note.draft && (
            <span className="rounded bg-amber-500/18 px-1.5 py-[1px] text-[10.5px] text-amber-400">draft</span>
          )}
        </div>

        <h1 className="mt-1.5 text-[25px] font-semibold leading-tight tracking-[-0.02em]">{note.title}</h1>
        <p className="mt-2.5 text-[15.5px] leading-[1.6] text-mid">{note.summary}</p>

        <p className="mt-3 text-[12.5px] text-lo">
          {note.subject} · {readingTime(note.body)} min read · {profile.name}
        </p>

        <hr className="my-6 border-0 border-t border-[var(--glass-stroke)]" />

        <div className="[&>*:first-child]:mt-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
            {note.body}
          </ReactMarkdown>
        </div>

        {/* part of the app rather than something to remember per note */}
        <aside className="mt-8 rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-lo">Disclaimer</p>
          <p className="text-[12.5px] leading-relaxed text-mid">
            Written for education and to show my own analysis. It is not investment advice, not a
            recommendation to buy or sell anything, and I am not a SEBI-registered Research Analyst.
            Figures come from the company&rsquo;s published filings; any errors are mine. Do your own
            work before acting on anything you read here.
          </p>
          <p className="mt-2 text-[12.5px] text-lo">
            Spotted a mistake?{" "}
            <a href={`mailto:${profile.email}`} className="text-[var(--accent)] underline underline-offset-2">
              Tell me
            </a>{" "}
            {Glyph.external}
          </p>
        </aside>
      </article>
    </div>
  );
}
