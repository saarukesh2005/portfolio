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
    id: "analyser",
    name: "Ratio Analyser",
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
    id: "timemachine",
    name: "Time Machine",
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
