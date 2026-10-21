/**
 * ─────────────────────────────────────────────────────────────
 *  EDIT THIS FILE — it is the only file you need to touch to
 *  change the content of the site. Everything else reads
 *  from here.
 *
 *  Everything below comes from your résumé
 *  (Saarukesh_K_Resume_StateStreet_1.docx). Nothing is invented.
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: "Saarukesh K",
  role: "B.Com (Corporate Secretaryship) · CMA Intermediate",
  tagline:
    "Finance graduate heading into financial services — financial statement analysis, ratio analysis and equity research.",
  location: "Chennai, India",
  email: "saarukesh.tn@gmail.com",

  /**
   * Deliberately empty: a public page gets crawled and scraped in a way a
   * résumé emailed to one employer does not. The number is still in the
   * downloadable résumé file, so anyone who actually wants it can get it.
   * Put it back by filling this in — the résumé header picks it up again.
   */
  phone: "",

  // Drop a square photo at public/avatar.jpg, then set this to "/avatar.jpg".
  // Left empty, the About window shows your initials.
  avatar: "",

  bio: [
    "I'm a B.Com (Corporate Secretaryship) graduate from D. G. Vaishnav College, Chennai, looking to start a long-term career in financial services.",
    "I completed the CMA Foundation (ICMAI) in December 2022, clearing all four papers with 264/400. I appeared for CMA Intermediate Group 1 in June 2026 and am waiting on the result, and I'm currently preparing for the NISM Series XV (Research Analyst) certification.",
    "My hands-on experience so far comes from my final-year research project — five years of Bharat Dynamics Limited's audited annual reports, worked through ratio by ratio — and a month of institutional training at a practising CA firm.",
  ],

  socials: [
    {
      label: "LinkedIn",
      handle: "saarukesh-k",
      url: "https://www.linkedin.com/in/saarukesh-k-97a3082a5",
      icon: "linkedin",
    },
    { label: "GitHub", handle: "saarukesh2005", url: "https://github.com/saarukesh2005", icon: "github" },
    { label: "Email", handle: "saarukesh.tn@gmail.com", url: "mailto:saarukesh.tn@gmail.com", icon: "mail" },
  ],
} as const;

export type Skill = { name: string; group: string };

export const skills: Skill[] = [
  { name: "Financial Statement Analysis", group: "Finance" },
  { name: "Ratio Analysis", group: "Finance" },
  { name: "Fundamental Analysis", group: "Finance" },
  { name: "Technical Analysis", group: "Finance" },

  { name: "MS Excel", group: "Tools" },
  { name: "MS Word", group: "Tools" },
  { name: "MS PowerPoint", group: "Tools" },

  { name: "Analytical Thinking", group: "Strengths" },
  { name: "Attention to Detail", group: "Strengths" },
  { name: "Problem-Solving", group: "Strengths" },
  { name: "Time Management", group: "Strengths" },
];

export type Certification = {
  name: string;
  issuer: string;
  period: string;
  status: "Completed" | "Result awaited" | "In progress";
  detail?: string;
};

export const certifications: Certification[] = [
  {
    name: "CMA Foundation",
    issuer: "ICMAI",
    period: "Dec 2022",
    status: "Completed",
    detail: "264/400 (66%) — all four papers cleared.",
  },
  {
    name: "CMA Intermediate — Group 1",
    issuer: "ICMAI",
    period: "Jun 2026",
    status: "Result awaited",
    detail: "Papers appeared.",
  },
  {
    name: "NISM Series XV — Research Analyst",
    issuer: "SEBI",
    period: "2026",
    status: "In progress",
    detail: "Currently preparing.",
  },
  {
    name: "Financial Markets, Banking & Finance",
    issuer: "Infact Pro Trainers (OPC) Pvt. Ltd.",
    period: "",
    status: "Completed",
  },
];

export type Project = {
  id: string;
  name: string;
  blurb: string;
  description: string[];
  tags: string[];
  year: string;
  accent: string; // tailwind gradient stops, e.g. "from-amber-500 to-orange-700"
  emoji: string; // stands in for a screenshot until you add one
  image?: string; // optional: "/projects/foo.png"
  live?: string;
  repo?: string;
  /** source is private — show a badge instead of a dead link */
  privateRepo?: boolean;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "bdl-financial-analysis",
    name: "Financial Performance Analysis — Bharat Dynamics Ltd.",
    blurb: "Five-year ratio and trend analysis of a listed defence-sector PSU.",
    description: [
      "Final-year research project at D. G. Vaishnav College, April 2025. Analysed the financial performance of Bharat Dynamics Ltd. (NSE: BDL), a listed defence-sector PSU, using its audited annual reports across five financial years.",
      "Computed and interpreted key financial ratios across profitability, efficiency and liquidity to assess the company's overall financial health, and studied multi-year trends in Sales, Net Profit and Working Capital to understand how the business performed over time.",
      "Reviewed BDL's corporate governance and regulatory compliance disclosures, and prepared a written report setting out the findings and conclusions.",
    ],
    tags: ["Ratio Analysis", "Fundamental Analysis", "Annual Reports", "Equity Research"],
    year: "2025",
    accent: "from-amber-500 to-orange-700",
    emoji: "📊",
    featured: true,
  },
  {
    id: "imtb",
    name: "IMTB — Indian Merged Trading Bot",
    blurb: "An algorithmic trading platform for NSE/BSE, built correctness-first on paper trading.",
    description: [
      "A trading platform for Indian markets assembled in phases, each one built and tested before the next: a market-data pipeline (instrument master, trading calendar, validation, TimescaleDB tick storage with a Redis hot cache), a pluggable strategy engine, a risk engine, and backtesting with performance analytics.",
      "The design decision I am most pleased with is that a backtest is not a separate code path — it replays the live execution path (strategy → signal → order → broker → position tracker) over stored candles with a steppable clock, so backtested and paper results cannot quietly diverge. Fills model fees and slippage.",
      "The risk engine enforces pre-trade limits on order size, position notional and open positions, plus a daily-loss and drawdown kill-switch that halts new entries while always allowing exits. Metrics are computed in Decimal, not floats: return, CAGR, Sharpe, Sortino, max drawdown, win rate, profit factor and expectancy.",
      "Deliberately paper-trading only. It is research software, not a licensed platform, and no real capital has gone through it.",
    ],
    tags: ["Python", "FastAPI", "TimescaleDB", "Redis", "Backtesting", "Risk Management"],
    year: "2026",
    accent: "from-sky-500 to-indigo-700",
    emoji: "📉",
    privateRepo: true,
    featured: true,
  },
  {
    id: "linkedin-agent",
    name: "LinkedIn Agent",
    blurb: "A publishing agent for finance content, with a SEBI-aware compliance verifier.",
    description: [
      "Generates and publishes LinkedIn posts on a schedule, running two streams: reactions to Indian market news pulled from RSS (markets, SEBI, RBI), and structured post types drawn from a content taxonomy that is the single source of truth — where the taxonomy and the code disagree, the taxonomy wins.",
      "The part that matters is the verifier. It runs in two layers: deterministic regex hard-stops that act as a SEBI safety net and cannot be weakened by editing the taxonomy, then an LLM red-line check on top. Finance content that implies advice is a regulatory problem, so the guard is structural rather than a setting.",
      "Nothing publishes without me. The pipeline is scrape → filter → generate → verify → human approval, with approval over Telegram. Each draft carries a UUID and the LinkedIn URN is stored before responding, so a retry can never double-post.",
      "Started from an open-source LinkedIn agent and kept its bones — the LangGraph pipeline, Redis sessions, scheduling — then replaced the brain: the finance domain, RSS in place of a paid scraper, the migration to LinkedIn's current /rest/posts endpoint, and OAuth with auto-refresh.",
    ],
    tags: ["Python", "LangGraph", "FastAPI", "Redis", "OAuth", "Compliance"],
    year: "2026",
    accent: "from-cyan-500 to-blue-700",
    emoji: "🤖",
    privateRepo: true,
  },
  {
    id: "saul-signal",
    name: "Signal Engine",
    blurb: "A content engine that turns the day's financial news into teachable Instagram carousels.",
    description: [
      "Reads the day's news, works out what can actually be taught from it, designs the slides, checks them against a compliance floor, and sends the result for approval: scrape → rank → compose → verify → render → notify.",
      "Output is a full carousel rendered at 1080×1350 — cover, two to five body slides, closing slide — with a caption and alt text for every slide. Layout archetypes are chosen from the meaning of the slide (comparison, equation, statistic, myth, definition, checklist, timeline, quote) rather than from its position in the deck.",
      "The cover slide gets a disproportionate share of the attention in both the prompt and the reach scoring, because on Instagram it is the whole impression for most of the audience — everything after it is only seen by people the cover already convinced.",
      "As with the LinkedIn agent, there is no code path from composition to a published post. The approval gate is a module boundary, not a flag.",
    ],
    tags: ["Python", "TypeScript", "Content Pipeline", "Compliance", "Telegram"],
    year: "2026",
    accent: "from-rose-500 to-red-700",
    emoji: "📰",
    privateRepo: true,
  },
];

export type Job = {
  role: string;
  company: string;
  period: string;
  location: string;
  points: string[];
};

export const experience: Job[] = [
  {
    role: "Institutional Training Intern",
    company: "S. R. Jain & Associates, Chartered Accountants",
    period: "Dec 2024 — Jan 2025",
    location: "Chennai, India",
    points: [
      "Completed a one-month institutional training programme at a practising CA firm as part of the B.Com curriculum.",
      "Observed how a CA firm manages audit support, financial statement preparation and compliance documentation in a live professional setting.",
      "Built familiarity with deadlines, documentation standards and client engagement practices in an accounting environment.",
    ],
  },
];

export const education = [
  {
    degree: "Bachelor of Commerce — Corporate Secretaryship",
    school: "D. G. Vaishnav College (Autonomous), University of Madras",
    period: "2022 — 2025",
    detail: "CGPA 5.98 / 10",
  },
  {
    degree: "Higher Secondary (Class XII), Commerce — CBSE",
    school: "Revoor Padmanabha Chetty's Matriculation Higher Secondary School",
    period: "2021 — 2022",
    detail: "",
  },
];

export const volunteering = [
  {
    org: "Rotaract Club (College Chapter)",
    period: "",
    detail: "Member; participated in voluntary blood donation drives.",
  },
  {
    org: "National Service Scheme (NSS), D. G. Vaishnav College",
    period: "2022 — 2025",
    detail: "Community engagement and blood donation initiatives.",
  },
];

export const languages = ["English", "Tamil"];

export type Milestone = {
  /** sortable key, YYYY-MM */
  at: string;
  label: string;
  title: string;
  detail: string;
  kind: "education" | "certification" | "work" | "project";
  status?: "done" | "awaiting" | "active";
};

/** Drives the Calendar app. Ordered automatically by `at`. */
export const timeline: Milestone[] = [
  {
    at: "2021-06",
    label: "2021 — 2022",
    title: "Higher Secondary (Class XII), Commerce",
    detail: "CBSE · Revoor Padmanabha Chetty's Matriculation Higher Secondary School",
    kind: "education",
    status: "done",
  },
  {
    at: "2022-07",
    label: "2022 — 2025",
    title: "B.Com — Corporate Secretaryship",
    detail: "D. G. Vaishnav College (Autonomous), University of Madras · CGPA 5.98 / 10",
    kind: "education",
    status: "done",
  },
  {
    at: "2022-12",
    label: "Dec 2022",
    title: "CMA Foundation cleared",
    detail: "ICMAI · 264/400 (66%), all four papers",
    kind: "certification",
    status: "done",
  },
  {
    at: "2024-12",
    label: "Dec 2024 — Jan 2025",
    title: "Institutional Training Intern",
    detail: "S. R. Jain & Associates, Chartered Accountants, Chennai",
    kind: "work",
    status: "done",
  },
  {
    at: "2025-04",
    label: "Apr 2025",
    title: "Financial Performance Analysis — Bharat Dynamics Ltd.",
    detail: "Final-year research project · five years of audited annual reports",
    kind: "project",
    status: "done",
  },
  {
    at: "2026-06",
    label: "Jun 2026",
    title: "CMA Intermediate — Group 1",
    detail: "ICMAI · papers appeared, result awaited",
    kind: "certification",
    status: "awaiting",
  },
  {
    at: "2026-10",
    label: "2026",
    title: "NISM Series XV — Research Analyst",
    detail: "SEBI certification · currently preparing",
    kind: "certification",
    status: "active",
  },
];

/** What the Résumé window's download button hands over. */
export const resumeFile = "/Saarukesh_K_Resume.docx";
