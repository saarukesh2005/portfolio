"use client";

import type { ComponentType, ReactNode } from "react";
import AboutApp from "@/components/apps/AboutApp";
import ProjectsApp from "@/components/apps/ProjectsApp";
import TerminalApp from "@/components/apps/TerminalApp";
import ResumeApp from "@/components/apps/ResumeApp";
import MailApp from "@/components/apps/MailApp";
import SettingsApp from "@/components/apps/SettingsApp";
import CrewApp from "@/components/apps/CrewApp";
import AnalyserApp from "@/components/apps/AnalyserApp";
import TimeMachineApp from "@/components/apps/TimeMachineApp";
import ToolkitApp from "@/components/apps/ToolkitApp";
import DebtEscapeApp from "@/components/apps/DebtEscapeApp";
import ResearchApp from "@/components/apps/ResearchApp";
import CalendarApp from "@/components/apps/CalendarApp";
import NumbersApp from "@/components/apps/NumbersApp";
import PhotosApp from "@/components/apps/PhotosApp";
import CalculatorApp from "@/components/apps/CalculatorApp";
import WantedApp from "@/components/apps/WantedApp";
import {
  LuffyIcon,
  ProjectsIcon,
  TerminalIcon,
  ResumeIcon,
  MailIcon,
  ShipIcon,
  AnalyserIcon,
  TimeMachineIcon,
  ToolkitIcon,
  DebtIcon,
  ResearchIcon,
  SettingsIcon,
  GithubIcon,
  LinkedinIcon,
  CalendarIcon,
  NumbersIcon,
  PhotosIcon,
  CalculatorIcon,
  WantedIcon,
} from "@/components/Icons";
import { profile } from "@/content/profile";
import { HIDDEN_APPS } from "@/lib/visibility";

export type AppDef = {
  id: string;
  /** shown in the menu bar, dock tooltip and window title */
  name: string;
  /** one line, shown in Quick Look */
  blurb: string;
  icon: ReactNode;
  Component?: ComponentType<{ payload?: unknown; active?: boolean }>;
  size: { w: number; h: number };
  /** pinned to the dock */
  dock: boolean;
  /** shown as an icon on the desktop */
  desktop: boolean;
  /** external link instead of a window */
  href?: string;
  /** drops off the dock on phones, where Launchpad covers it instead */
  secondaryDock?: boolean;
  keywords: string[];
  /** app-specific menu bar entries */
  menus?: { label: string; items: (string | "---")[] }[];
};

const FILE_MENU = { label: "File", items: ["New Window", "---", "Close  ⌘W"] };
const EDIT_MENU = { label: "Edit", items: ["Undo  ⌘Z", "Redo  ⇧⌘Z", "---", "Cut  ⌘X", "Copy  ⌘C", "Paste  ⌘V"] };
const VIEW_MENU = { label: "View", items: ["Enter Full Screen  ⌃⌘F"] };
const WINDOW_MENU = { label: "Window", items: ["Minimise  ⌘M", "Zoom", "---", "Bring All to Front"] };

const ALL_APPS: AppDef[] = [
  {
    id: "about",
    name: "About Me",
    blurb: "Bio, skills, certifications, experience and education.",
    icon: <LuffyIcon />,
    Component: AboutApp,
    size: { w: 840, h: 560 },
    dock: true,
    desktop: true,
    keywords: ["about", "me", "bio", "finder", "profile", "skills", "experience", "education"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "projects",
    name: "Projects",
    blurb: "Case studies, with the full write-up behind each one.",
    icon: <ProjectsIcon />,
    Component: ProjectsApp,
    size: { w: 900, h: 610 },
    dock: true,
    desktop: true,
    keywords: ["projects", "work", "portfolio", "case", "studies", "gallery"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "terminal",
    name: "Terminal",
    blurb: "A real shell. Type help.",
    icon: <TerminalIcon />,
    Component: TerminalApp,
    size: { w: 760, h: 480 },
    dock: true,
    desktop: true,
    keywords: ["terminal", "shell", "console", "cli", "zsh", "command"],
    menus: [
      { label: "Shell", items: ["New Window  ⌘N", "---", "Close  ⌘W"] },
      EDIT_MENU,
      { label: "View", items: ["Clear Buffer  ⌘L"] },
      WINDOW_MENU,
    ],
  },
  {
    id: "research",
    name: "Research",
    blurb: "Equity research notes and company write-ups — the reasoning, not just the conclusion.",
    icon: <ResearchIcon />,
    Component: ResearchApp,
    size: { w: 880, h: 660 },
    dock: true,
    secondaryDock: true,
    desktop: true,
    keywords: ["research", "equity", "notes", "blog", "writing", "reports", "analysis", "posts", "articles"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "analyser",
    name: "Ratio Analyser",
    blurb: "Enter a company's figures, get twelve ratios read back in plain English.",
    icon: <AnalyserIcon />,
    Component: AnalyserApp,
    size: { w: 960, h: 640 },
    dock: true,
    secondaryDock: true,
    desktop: true,
    keywords: ["ratio", "analyser", "analyzer", "analysis", "finance", "financial", "liquidity", "profitability", "leverage", "efficiency", "calculator", "balance sheet"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "numbers",
    name: "Numbers",
    blurb: "Ratio tables and trend charts from the annual reports.",
    icon: <NumbersIcon />,
    Component: NumbersApp,
    size: { w: 880, h: 600 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["numbers", "spreadsheet", "ratios", "financials", "analysis", "bdl", "charts", "excel"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "debt",
    name: "Debt Escape",
    blurb: "Plan a way out of multiple debts — which first, how long, and what a pay cut would do.",
    icon: <DebtIcon />,
    Component: DebtEscapeApp,
    size: { w: 980, h: 660 },
    dock: true,
    secondaryDock: true,
    desktop: true,
    keywords: ["debt", "escape", "loan", "emi", "payoff", "avalanche", "snowball", "repayment", "credit card", "cash flow", "rescue"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "toolkit",
    name: "Finance Toolkit",
    blurb: "Loan EMI with an amortisation chart, SIP projections, and break-even analysis.",
    icon: <ToolkitIcon />,
    Component: ToolkitApp,
    size: { w: 900, h: 620 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["toolkit", "finance", "loan", "emi", "sip", "lumpsum", "investment", "break-even", "breakeven", "mortgage", "calculator", "planner"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "timemachine",
    name: "Time Machine",
    blurb: "Travel back through the milestones and see what was true at each point.",
    icon: <TimeMachineIcon />,
    Component: TimeMachineApp,
    size: { w: 860, h: 620 },
    dock: true,
    secondaryDock: true,
    desktop: true,
    keywords: ["time machine", "timemachine", "history", "journey", "backup", "restore", "past", "story", "travel"],
    menus: [FILE_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "calendar",
    name: "Calendar",
    blurb: "The whole journey as a filterable timeline.",
    icon: <CalendarIcon />,
    Component: CalendarApp,
    size: { w: 760, h: 580 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["calendar", "timeline", "journey", "milestones", "dates", "roadmap"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "photos",
    name: "Photos",
    blurb: "Certificates and marksheets.",
    icon: <PhotosIcon />,
    Component: PhotosApp,
    size: { w: 820, h: 580 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["photos", "certificates", "marksheet", "gallery", "proof", "awards"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "resume",
    name: "Résumé",
    blurb: "The full CV, rendered live. ⌘P prints it clean.",
    icon: <ResumeIcon />,
    Component: ResumeApp,
    size: { w: 780, h: 640 },
    dock: true,
    desktop: true,
    keywords: ["resume", "cv", "curriculum", "pdf", "download", "experience"],
    menus: [FILE_MENU, EDIT_MENU, VIEW_MENU, WINDOW_MENU],
  },
  {
    id: "crew",
    name: "Join my Crew",
    blurb: "What I'm open to — hiring, study partners, research, or something you're building.",
    icon: <ShipIcon />,
    Component: CrewApp,
    size: { w: 780, h: 620 },
    dock: true,
    // the phone dock holds six before Résumé and Contact get pushed off-screen
    secondaryDock: true,
    desktop: true,
    keywords: ["crew", "join", "work with me", "collaborate", "hire", "team", "ship", "partner", "opportunities"],
    menus: [FILE_MENU, EDIT_MENU, WINDOW_MENU],
  },
  {
    id: "mail",
    name: "Contact",
    blurb: "A compose window that hands off to your own mail client.",
    icon: <MailIcon />,
    Component: MailApp,
    size: { w: 720, h: 540 },
    dock: true,
    desktop: false,
    keywords: ["contact", "mail", "email", "hire", "message", "reach"],
    menus: [
      { label: "Message", items: ["New Message  ⌘N", "Send  ⌘⏎", "---", "Close  ⌘W"] },
      EDIT_MENU,
      WINDOW_MENU,
    ],
  },
  {
    id: "settings",
    name: "System Settings",
    blurb: "Appearance, wallpapers and shortcuts.",
    icon: <SettingsIcon />,
    Component: SettingsApp,
    size: { w: 700, h: 520 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["settings", "preferences", "wallpaper", "theme", "appearance", "dark", "light"],
    menus: [FILE_MENU, EDIT_MENU, WINDOW_MENU],
  },
  {
    id: "calculator",
    name: "Calculator",
    blurb: "Does what it says, keyboard included.",
    icon: <CalculatorIcon />,
    Component: CalculatorApp,
    // 5 rows of square keys plus the display need this much, or the "=" row clips
    size: { w: 300, h: 496 },
    dock: true,
    secondaryDock: true,
    desktop: false,
    keywords: ["calculator", "calc", "maths", "arithmetic", "percent"],
    menus: [EDIT_MENU, WINDOW_MENU],
  },
  {
    id: "wanted",
    name: "Wanted",
    blurb: "A bounty poster built from the actual CV. Purely for fun.",
    icon: <WantedIcon />,
    Component: WantedApp,
    size: { w: 500, h: 640 },
    dock: true,
    // thirteen icons already crowd a phone dock; Launchpad covers it there
    secondaryDock: true,
    desktop: false,
    keywords: ["wanted", "bounty", "poster", "one piece", "luffy", "pirate", "fun"],
    menus: [FILE_MENU, WINDOW_MENU],
  },
  {
    id: "github",
    name: "GitHub",
    blurb: "Code, on GitHub.",
    icon: <GithubIcon />,
    size: { w: 0, h: 0 },
    dock: true,
    desktop: true,
    href: profile.socials.find((s) => s.icon === "github")?.url,
    keywords: ["github", "code", "repo", "source", "git"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    blurb: "The professional profile.",
    icon: <LinkedinIcon />,
    size: { w: 0, h: 0 },
    dock: true,
    desktop: false,
    href: profile.socials.find((s) => s.icon === "linkedin")?.url,
    keywords: ["linkedin", "hire", "network", "cv"],
  },
];

/**
 * An app with nothing in it is worse than no app at all — a visitor clicking
 * an empty window learns only that the site is unfinished. See lib/visibility.
 */
export const APPS: AppDef[] = ALL_APPS.filter((a) => !HIDDEN_APPS.has(a.id));

export const appById = (id: string) => APPS.find((a) => a.id === id);
