"use client";

import { useRef, useState } from "react";
import { extractFigures, pdfToText, type Match } from "@/lib/extract";
import type { Figures } from "@/lib/ratios";

type Stage = "idle" | "reading" | "review" | "empty" | "error";

export default function DocumentImport({
  onApply,
  onClose,
}: {
  onApply: (figures: Partial<Figures>) => void;
  onClose: () => void;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [matches, setMatches] = useState<Match[]>([]);
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [pasted, setPasted] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleText(text: string, origin: string) {
    const found = extractFigures(text);
    if (found.length === 0) {
      setNote(
        origin === "pdf"
          ? "No figures found. If this is a scanned PDF it has no text layer to read — copy the numbers out and paste them instead."
          : "No figures found in that text. Paste the statement lines, each with its caption and number."
      );
      setStage("empty");
      return;
    }
    setMatches(found);
    setChosen(new Set(found.filter((m) => m.confidence === "high").map((m) => m.key)));
    setNote(`Found ${found.length} of 12 figures${origin === "pdf" ? " in the PDF" : ""}.`);
    setStage("review");
  }

  async function handleFile(file: File) {
    setStage("reading");
    setNote(`Reading ${file.name}…`);
    try {
      if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
        const { text, pages } = await pdfToText(file);
        handleText(text, "pdf");
        if (pages > 40) setNote((n) => `${n} (read the first 40 of ${pages} pages)`);
      } else {
        handleText(await file.text(), "text");
      }
    } catch {
      setNote("Could not read that file. A PDF, .txt or .csv works; try pasting the text instead.");
      setStage("error");
    }
  }

  const apply = () => {
    const out: Partial<Figures> = {};
    for (const m of matches) if (chosen.has(m.key)) out[m.key] = m.value;
    onApply(out);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "var(--win-bg)" }}>
      <div className="flex shrink-0 items-center justify-between border-b border-[var(--glass-stroke)] px-4 py-2.5">
        <h2 className="text-[13.5px] font-semibold">Import from a document</h2>
        <button
          onClick={onClose}
          className="rounded-md bg-[var(--fill-2)] px-2.5 py-1 text-[12px] text-mid transition-colors hover:bg-[var(--fill-3)]"
        >
          Cancel
        </button>
      </div>

      <div className="mac-scroll flex-1 overflow-y-auto p-4">
        {(stage === "idle" || stage === "empty" || stage === "error") && (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className="mb-3 rounded-xl border border-dashed border-[var(--glass-stroke)] bg-[var(--fill-1)] p-6 text-center"
            >
              <p className="text-[13px] text-mid">Drop an annual report PDF here</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2.5 rounded-lg bg-[var(--accent)] px-3.5 py-1.5 text-[12.5px] font-medium text-white transition-opacity hover:opacity-88"
              >
                Choose a file
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.csv,application/pdf,text/plain,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <p className="mt-2 text-[11.5px] leading-relaxed text-lo">
                Read in your browser — nothing is uploaded anywhere.
              </p>
            </div>

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-lo">Or paste the statement</p>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder={"Revenue from operations    2,450\nTotal current assets       1,180\nTotal equity               1,460"}
              className="mac-scroll h-[140px] w-full resize-none rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] p-3 font-mono text-[12px] leading-relaxed outline-none placeholder:text-lo focus:border-[var(--accent)]"
            />
            <button
              onClick={() => handleText(pasted, "text")}
              disabled={!pasted.trim()}
              className="mt-2.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[12.5px] font-medium text-white transition-opacity hover:opacity-88 disabled:opacity-35"
            >
              Scan pasted text
            </button>

            {note && <p className="mt-3 text-[12.5px] leading-relaxed text-amber-400">{note}</p>}
          </>
        )}

        {stage === "reading" && (
          <div className="grid place-items-center py-16 text-center">
            <div>
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-[var(--fill-3)] border-t-[var(--accent)]" />
              <p className="text-[13px] text-mid">{note}</p>
            </div>
          </div>
        )}

        {stage === "review" && (
          <>
            <p className="mb-1 text-[13px] text-mid">{note}</p>
            <p className="mb-3 text-[11.5px] leading-relaxed text-lo">
              Captions vary between reports, so check each line before applying. Medium-confidence
              matches start unticked.
            </p>

            <div className="space-y-1.5">
              {matches.map((m) => {
                const on = chosen.has(m.key);
                return (
                  <label
                    key={m.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      on ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--glass-stroke)] bg-[var(--fill-1)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setChosen((c) => {
                          const next = new Set(c);
                          if (next.has(m.key)) next.delete(m.key);
                          else next.add(m.key);
                          return next;
                        })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="text-[13px] font-medium">{m.label}</span>
                        <span className="font-mono text-[13px] tabular-nums">
                          {m.value.toLocaleString("en-IN")}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[11px] text-lo">{m.source}</span>
                      {m.confidence === "medium" && (
                        <span className="mt-1 inline-block rounded bg-amber-500/18 px-1.5 py-[1px] text-[10.5px] text-amber-400">
                          check this one
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={apply}
                disabled={chosen.size === 0}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white transition-opacity hover:opacity-88 disabled:opacity-35"
              >
                Apply {chosen.size} figure{chosen.size === 1 ? "" : "s"}
              </button>
              <button
                onClick={() => {
                  setStage("idle");
                  setNote("");
                }}
                className="rounded-lg border border-[var(--glass-stroke)] bg-[var(--fill-2)] px-4 py-2 text-[13px] transition-colors hover:bg-[var(--fill-3)]"
              >
                Start over
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
