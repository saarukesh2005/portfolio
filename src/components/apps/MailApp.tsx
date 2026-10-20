"use client";

import { useState } from "react";
import { profile } from "@/content/profile";
import { socialGlyphs, Glyph } from "@/components/Icons";
import { useSystem } from "@/lib/store";

export default function MailApp() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [from, setFrom] = useState("");
  const notify = useSystem((s) => s.notify);
  const [copied, setCopied] = useState(false);

  function send() {
    const b = `${body}\n\n— ${from || "someone from your website"}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject || "Hello!")}&body=${encodeURIComponent(b)}`;
    notify({ app: "Mail", title: "Handing off to your mail app", body: "If nothing opened, copy the address instead.", emoji: "✉️" });
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      notify({ app: "Mail", title: "Copied", body: profile.email, emoji: "📋" });
    } catch {
      notify({ app: "Mail", title: "Couldn't copy", body: profile.email, emoji: "⚠️" });
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* header fields */}
      <div className="shrink-0 border-b border-[var(--glass-stroke)]" style={{ background: "var(--win-chrome)" }}>
        <Field label="To">
          <span className="rounded-md bg-[var(--accent)]/22 px-2 py-[3px] text-[13px] text-[var(--accent)]">{profile.name} &lt;{profile.email}&gt;</span>
        </Field>
        <Field label="From">
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="your name / email"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-lo"
          />
        </Field>
        <Field label="Subject">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Let's build something"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-lo"
          />
        </Field>
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Hi ${profile.name.split(" ")[0]},\n\n`}
        className="mac-scroll min-h-0 flex-1 resize-none bg-transparent p-4 text-[13.5px] leading-relaxed outline-none placeholder:text-lo"
      />

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--glass-stroke)] p-3" style={{ background: "var(--win-chrome)" }}>
        <button
          onClick={send}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-[7px] text-[13px] font-medium text-white transition-opacity hover:opacity-88"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m3.5 11.8 17-7.3-7.3 17-2.1-7.6z" />
          </svg>
          Send
        </button>
        <button
          onClick={copyEmail}
          className="rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-2)] px-3.5 py-[7px] text-[13px] transition-colors hover:bg-[var(--fill-3)]"
        >
          {copied ? "Copied ✓" : "Copy address"}
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {profile.socials
            .filter((s) => s.icon !== "mail")
            .map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                title={s.label}
                className="h-7 w-7 transition-transform hover:-translate-y-0.5"
              >
                {socialGlyphs[s.icon]}
              </a>
            ))}
        </div>
      </div>

      <p className="shrink-0 border-t border-[var(--glass-stroke)] px-3 py-1.5 text-[11px] text-lo">
        <span className="inline-flex items-center gap-1">{Glyph.external} Send opens your own mail client — nothing is stored here.</span>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--glass-stroke)] px-4 py-2 last:border-b-0">
      <span className="w-[56px] shrink-0 text-right text-[12px] text-lo">{label}:</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
