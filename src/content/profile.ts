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
   * Shown on the résumé window and in the Contact app.
   * A public site is not the same as a résumé you hand to one employer —
   * set this to "" if you would rather keep your number off the web.
   */
  phone: "+91 63747 68496",

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
