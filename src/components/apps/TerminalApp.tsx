"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile, projects, skills, certifications, experience, education } from "@/content/profile";
import { useSystem, useWindows } from "@/lib/store";
import { HIDDEN_APPS } from "@/lib/visibility";
import { DevilFruit } from "@/components/Icons";

type Line = { id: number; node: ReactNode };

/** every id `open` accepts, surfaced in `help` so the list can't go stale */
const OPEN_TARGETS =
  "about · projects · analyser · timemachine · calendar · photos · resume · crew · contact · terminal · calculator · wanted · settings";

const USER = "guest";
const HOST = profile.name.split(" ")[0].toLowerCase() + "-mbp";

const COMMANDS = [
  "help", "whoami", "about", "skills", "certifications", "education",
  "experience", "projects", "open", "cat", "ls", "contact", "social",
  "resume", "neofetch", "date", "echo", "theme", "history", "clear",
  "exit", "sudo",
] as const;

const C = {
  g: "text-emerald-400",
  b: "text-sky-400",
  y: "text-amber-300",
  p: "text-fuchsia-400",
  r: "text-red-400",
  d: "text-white/45",
};

export default function TerminalApp() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const seq = useRef(0);
  const greeted = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openWindow = useWindows((s) => s.open);
  const notify = useSystem((s) => s.notify);
  const setAppearance = useSystem((s) => s.setAppearance);

  const push = (node: ReactNode) => setLines((l) => [...l, { id: ++seq.current, node }]);

  useEffect(() => {
    if (greeted.current) return;
    greeted.current = true;
    push(<Banner />);
    push(
      <p className={C.d}>
        Type <span className={C.g}>help</span> to see what this thing knows.
      </p>
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  function run(raw: string) {
    const cmd = raw.trim();
    push(<Prompt text={cmd} />);
    if (!cmd) return;

    setHistory((h) => [...h, cmd]);
    setHIdx(-1);

    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    switch (name.toLowerCase()) {
      case "help":
        return push(<Help />);

      case "whoami":
        return push(
          <p>
            <span className={C.g}>{profile.name}</span> — {profile.role}
            <br />
            <span className={C.d}>{profile.tagline}</span>
          </p>
        );

      case "about":
        return push(
          <div className="space-y-2">
            {profile.bio.map((b, i) => (
              <p key={i} className="max-w-[78ch] leading-relaxed">{b}</p>
            ))}
          </div>
        );

      case "skills": {
        const groups = [...new Set(skills.map((s) => s.group))];
        return push(
          <div className="space-y-2">
            {groups.map((g) => (
              <p key={g}>
                <span className={C.y}>{g.padEnd(11)}</span>
                <span className="text-white/80">{skills.filter((s) => s.group === g).map((s) => s.name).join("  ·  ")}</span>
              </p>
            ))}
          </div>
        );
      }

      case "certifications":
      case "certs":
        return push(
          <div className="space-y-1">
            {certifications.map((c) => (
              <p key={c.name}>
                <span className={C.y}>{c.name}</span>
                <span className={C.d}> — {c.issuer}{c.period ? ` · ${c.period}` : ""} · </span>
                <span className={c.status === "Completed" ? C.g : c.status === "In progress" ? C.b : C.y}>{c.status}</span>
              </p>
            ))}
          </div>
        );

      case "education":
        return push(
          <div className="space-y-1.5">
            {education.map((e) => (
              <p key={e.degree}>
                <span className={C.g}>{e.degree}</span>
                <br />
                <span className={C.d}>
                  {e.school} · {e.period}
                  {e.detail ? ` · ${e.detail}` : ""}
                </span>
              </p>
            ))}
          </div>
        );

      case "experience":
        return push(
          <div className="space-y-2">
            {experience.map((j) => (
              <p key={j.role + j.company}>
                <span className={C.g}>{j.role}</span> @ {j.company} <span className={C.d}>({j.period})</span>
              </p>
            ))}
          </div>
        );

      case "projects":
      case "ls":
        return push(
          <div className="space-y-1">
            {projects.map((p) => (
              <p key={p.id}>
                <span className={C.b}>{p.id.padEnd(20)}</span>
                <span className="text-white/75">{p.blurb}</span>
              </p>
            ))}
            <p className={`${C.d} pt-1`}>
              → <span className={C.g}>cat &lt;name&gt;</span> for detail, or <span className={C.g}>open projects</span> for the gallery.
            </p>
          </div>
        );

      case "cat": {
        if (!arg) return push(<p className={C.r}>cat: missing operand. Try `cat {projects[0].id}` or `cat resume`.</p>);
        if (/^resume(\.txt|\.pdf)?$/i.test(arg)) {
          openWindow("resume", { size: { w: 760, h: 620 } });
          return push(<p className={C.d}>Opening résumé…</p>);
        }
        const p = projects.find((x) => x.id === arg || x.name.toLowerCase() === arg.toLowerCase());
        if (!p) return push(<p className={C.r}>cat: {arg}: No such file or directory</p>);
        return push(
          <div className="space-y-1.5">
            <p>
              <span className={C.p}>{p.name}</span> <span className={C.d}>({p.year})</span>
            </p>
            {p.description.map((d, i) => (
              <p key={i} className="max-w-[78ch] leading-relaxed text-white/80">{d}</p>
            ))}
            <p className={C.d}>stack: {p.tags.join(", ")}</p>
            {p.repo && <p className={C.d}>repo:  {p.repo}</p>}
            {p.live && <p className={C.d}>live:  {p.live}</p>}
          </div>
        );
      }

      case "open": {
        // Kept here rather than read from the app registry, because the
        // registry imports this component — reading it back would be a cycle.
        const map: Record<string, { app: string; size?: { w: number; h: number } }> = {
          about: { app: "about", size: { w: 840, h: 560 } },
          terminal: { app: "terminal", size: { w: 760, h: 480 } },
          projects: { app: "projects", size: { w: 900, h: 610 } },
          analyser: { app: "analyser", size: { w: 960, h: 640 } },
          ratios: { app: "analyser", size: { w: 960, h: 640 } },
          numbers: { app: "numbers", size: { w: 880, h: 600 } },
          timemachine: { app: "timemachine", size: { w: 860, h: 620 } },
          time: { app: "timemachine", size: { w: 860, h: 620 } },
          calendar: { app: "calendar", size: { w: 760, h: 580 } },
          photos: { app: "photos", size: { w: 820, h: 580 } },
          resume: { app: "resume", size: { w: 780, h: 640 } },
          crew: { app: "crew", size: { w: 780, h: 620 } },
          join: { app: "crew", size: { w: 780, h: 620 } },
          contact: { app: "mail", size: { w: 720, h: 540 } },
          mail: { app: "mail", size: { w: 720, h: 540 } },
          calculator: { app: "calculator", size: { w: 300, h: 496 } },
          wanted: { app: "wanted", size: { w: 500, h: 640 } },
          bounty: { app: "wanted", size: { w: 500, h: 640 } },
          settings: { app: "settings", size: { w: 700, h: 520 } },
        };
        const t = map[arg.toLowerCase()];
        // a hidden app has no registry entry, so opening one would put a
        // window in state that nothing can render or close
        if (!t || HIDDEN_APPS.has(t.app)) {
          const open = Object.keys(map).filter((k) => !HIDDEN_APPS.has(map[k].app));
          return push(<p className={C.r}>open: unknown app “{arg}”. Try: {open.join(", ")}</p>);
        }
        openWindow(t.app, { size: t.size });
        return push(<p className={C.d}>Launching {arg}…</p>);
      }

      case "contact":
      case "email":
        openWindow("mail", { size: { w: 720, h: 540 } });
        return push(
          <p>
            <span className={C.g}>{profile.email}</span> <span className={C.d}>— compose window opened.</span>
          </p>
        );

      case "social":
        return push(
          <div className="space-y-1">
            {profile.socials.map((s) => (
              <p key={s.label}>
                <span className={C.y}>{s.label.padEnd(10)}</span>
                <a href={s.url} target="_blank" rel="noreferrer noopener" className={`${C.b} underline underline-offset-2 hover:text-sky-300`}>
                  {s.url}
                </a>
              </p>
            ))}
          </div>
        );

      case "resume":
        openWindow("resume", { size: { w: 760, h: 620 } });
        return push(<p className={C.d}>Opening résumé…</p>);

      case "neofetch":
        return push(<Neofetch />);

      case "date":
        return push(<p className="text-white/80">{new Date().toString()}</p>);

      case "echo":
        return push(<p className="text-white/80">{arg}</p>);

      case "theme": {
        const v = arg.toLowerCase();
        if (v !== "light" && v !== "dark") return push(<p className={C.r}>usage: theme light|dark</p>);
        setAppearance(v);
        return push(<p className={C.d}>Appearance set to {v}.</p>);
      }

      case "history":
        return push(
          <div className="space-y-0.5">
            {history.map((h, i) => (
              <p key={i}>
                <span className={C.d}>{String(i + 1).padStart(3)}  </span>
                {h}
              </p>
            ))}
          </div>
        );

      case "sudo":
        notify({ app: "Terminal", title: "Permission denied", body: `${USER} is not in the sudoers file. This incident has been reported.`, emoji: "🚫" });
        return push(<p className={C.r}>{USER} is not in the sudoers file. This incident has been reported.</p>);

      case "rm":
        return push(<p className={C.y}>Nice try. This is a portfolio, not a hostage situation.</p>);

      case "clear":
        return setLines([]);

      case "exit":
        return push(<p className={C.d}>There is no escape. (Try the red traffic light.)</p>);

      default:
        return push(
          <p className={C.r}>
            zsh: command not found: {name} <span className={C.d}>— try `help`</span>
          </p>
        );
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      run(input);
      setInput("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(next);
      setInput(history[next]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx === -1) return;
      const next = hIdx + 1;
      if (next >= history.length) {
        setHIdx(-1);
        setInput("");
      } else {
        setHIdx(next);
        setInput(history[next]);
      }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(/\s+/);
      if (parts.length <= 1) {
        const m = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
        if (m.length === 1) setInput(m[0] + " ");
        else if (m.length > 1) push(<p className={C.d}>{m.join("   ")}</p>);
      } else {
        const last = parts[parts.length - 1].toLowerCase();
        const m = projects.map((p) => p.id).filter((id) => id.startsWith(last));
        if (m.length === 1) setInput([...parts.slice(0, -1), m[0]].join(" ") + " ");
        else if (m.length > 1) push(<p className={C.d}>{m.join("   ")}</p>);
      }
      return;
    }
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setLines([]);
    }
  }

  return (
    <div
      className="mac-scroll h-full overflow-y-auto p-3.5 font-mono text-[12.5px] leading-[1.55] text-white/90 selection:bg-emerald-400/30"
      ref={scrollRef}
      onMouseDown={(e) => {
        // let the user select text; only focus when it's a plain click
        if (window.getSelection()?.toString()) return;
        if ((e.target as HTMLElement).tagName !== "A") inputRef.current?.focus();
      }}
      style={{ background: "#0b0e14" }}
    >
      {lines.map((l) => (
        <div key={l.id} className="mb-1.5 whitespace-pre-wrap break-words">
          {l.node}
        </div>
      ))}

      <div className="flex items-center gap-1.5">
        <PromptLabel />
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            aria-label="Terminal input"
            className="w-full bg-transparent font-mono text-[12.5px] text-white/90 caret-transparent outline-none"
          />
          <span
            aria-hidden
            className="caret pointer-events-none absolute top-0 inline-block h-[1.3em] w-[7.6px] bg-emerald-400/90"
            style={{ left: `${input.length * 7.52}px` }}
          />
        </div>
      </div>
    </div>
  );
}

function PromptLabel() {
  return (
    <span className="shrink-0 whitespace-pre">
      <span className={C.g}>{USER}</span>
      <span className={C.d}>@</span>
      <span className={C.b}>{HOST}</span>
      <span className={C.d}> ~ </span>
      <span className={C.p}>$</span>
    </span>
  );
}

function Prompt({ text }: { text: string }) {
  return (
    <p>
      <PromptLabel /> <span className="text-white/90">{text}</span>
    </p>
  );
}

function Banner() {
  const rows = [profile.name, profile.role, profile.location];
  const width = Math.max(...rows.map((r) => r.length), 22) + 2;
  const pad = (r: string) => `│ ${r.padEnd(width)}│`;

  return (
    <pre className="mb-1 text-[11px] leading-[1.35] text-emerald-400/90 sm:text-[12px]">
      {[`┌${"─".repeat(width + 1)}┐`, pad(rows[0]), pad(rows[1]), pad(rows[2]), `└${"─".repeat(width + 1)}┘`].join("\n")}
    </pre>
  );
}

function Help() {
  const rows: [string, string][] = [
    ["help", "show this list"],
    ["whoami", "who is behind this site"],
    ["about", "the longer version"],
    ["education", "degrees and schools"],
    ["certifications", "CMA, NISM and the rest"],
    ["experience", "where I've worked"],
    ["skills", "what I work with"],
    ["ls / projects", "list projects"],
    ["cat <project>", "read a project in full"],
    ["open <app>", OPEN_TARGETS],
    ["contact", "email address + compose window"],
    ["social", "links to every profile"],
    ["resume", "open the résumé"],
    ["neofetch", "system info, obviously"],
    ["theme light|dark", "switch appearance"],
    ["date · echo · history", "the usual suspects"],
    ["clear", "wipe the screen (⌘L / ⌃L)"],
  ];
  return (
    <div className="space-y-0.5">
      {rows.map(([cmd, desc]) => (
        <p key={cmd}>
          <span className={`${C.g} inline-block w-[19ch]`}>{cmd}</span>
          <span className="text-white/70">{desc}</span>
        </p>
      ))}
      <p className={`${C.d} pt-1.5`}>↑/↓ history · Tab completes · ⌘K opens Spotlight</p>
    </div>
  );
}

function Neofetch() {
  const rows: [string, string][] = [
    ["OS", "macOS (the browser kind)"],
    ["Host", "Portfolio MacBook Pro"],
    ["Shell", "zsh (lovingly faked)"],
    ["Role", profile.role],
    ["Location", profile.location],
    ["Email", profile.email],
    ["Education", education[0].degree],
    ["Certs", `${certifications.filter((c) => c.status === "Completed").length} completed · ${certifications.filter((c) => c.status !== "Completed").length} in flight`],
    ["Projects", String(projects.length)],
  ];
  return (
    <div className="flex items-center gap-6">
      <DevilFruit className="hidden h-[64px] w-[64px] shrink-0 sm:block" />
      <div className="space-y-0.5">
        {rows.map(([k, v]) => (
          <p key={k}>
            <span className={`${C.y} inline-block w-[10ch]`}>{k}</span>
            <span className="text-white/80">{v}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
