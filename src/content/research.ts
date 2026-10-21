/**
 * Equity research notes and write-ups.
 *
 * Write the body in Markdown inside a template literal — headings, lists,
 * tables, bold, links and quotes all render. Tables are worth using for the
 * financial summary; they read far better than prose for figures.
 *
 * `draft: true` keeps a note out of the published site while still showing it
 * on localhost, so you can see how something looks before anyone else does.
 * The whole app stays hidden until at least one note is published.
 *
 * On recommendations: issuing buy/sell calls publicly is regulated in India
 * (SEBI Research Analyst Regulations) — which is what the NISM Series XV
 * certification is for. Until that is in hand, the honest and safe framing is
 * analysis and reasoning rather than a call to act. The disclaimer at the foot
 * of every note is part of the app, not something you have to remember.
 */

export type ResearchNote = {
  slug: string;
  title: string;
  /** company or theme the note is about */
  subject: string;
  /** e.g. "NSE: BDL" — optional */
  ticker?: string;
  /** YYYY-MM-DD */
  date: string;
  /** one or two sentences; shown in the list */
  summary: string;
  tags: string[];
  /** Markdown */
  body: string;
  /** hidden in production, visible on localhost */
  draft?: boolean;
};

export const research: ResearchNote[] = [
  {
    slug: "template",
    title: "How I read a set of accounts",
    subject: "Method",
    date: "2026-10-21",
    draft: true,
    summary:
      "A draft placeholder so the layout can be checked before anything real is published. Delete it, or rewrite it in your own words.",
    tags: ["Method", "Draft"],
    body: `
> This note is a **draft**. It is visible on localhost and hidden on the live
> site. Delete it, or replace it with your own, once you have a real note to publish.

## What this section is for

Equity research notes go here — the write-ups you produce after the exams.
Everything below is just a demonstration of what renders.

## Structure that tends to work

1. **The question.** What are you actually trying to find out?
2. **The business.** What does it sell, to whom, and what decides whether that grows?
3. **The numbers.** Five years, read as a trend rather than a snapshot.
4. **What would change your mind.** The strongest part of any note.

## Tables render

| Metric | FY22 | FY23 | FY24 |
|---|---:|---:|---:|
| Revenue (₹ Cr) | — | — | — |
| Operating margin | — | — | — |
| ROE | — | — | — |

## So does everything else

Lists, \`inline code\`, [links](https://example.com), **bold** and *italics*.

---

The point of a note is the reasoning, not the conclusion. A write-up that
shows how you got somewhere is worth more than one that only says where you
landed.
`,
  },
];

/** Notes visible to a visitor — drafts are kept back in production. */
export const publishedResearch = (): ResearchNote[] =>
  research
    .filter((n) => !n.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => b.date.localeCompare(a.date));

/** Rough reading time, at about 200 words a minute. */
export const readingTime = (body: string) =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
