/**
 * Pulls financial line items out of pasted text or a PDF's text layer.
 *
 * This is deliberately a *suggestion* engine, not an oracle. Annual reports
 * vary wildly in wording and layout, so every match is surfaced with the line
 * it came from and must be confirmed before it reaches the analyser. Silently
 * filling a finance tool with mis-parsed numbers would be worse than useless.
 */

import type { Figures } from "@/lib/ratios";

export type Match = {
  key: keyof Figures;
  label: string;
  value: number;
  /** the source line, shown so the reading can be checked */
  source: string;
  confidence: "high" | "medium";
};

/**
 * Caption patterns, most specific first — the first hit for a key wins.
 * Written against Ind AS / Schedule III wording, which is what Indian listed
 * companies file, with common IFRS phrasings alongside.
 */
const PATTERNS: { key: keyof Figures; label: string; rx: RegExp; confidence: "high" | "medium" }[] = [
  { key: "revenue", label: "Revenue", confidence: "high", rx: /revenue\s+from\s+operations/i },
  { key: "revenue", label: "Revenue", confidence: "medium", rx: /^\s*(total\s+)?(income|revenue|net\s+sales|turnover)\b/i },

  { key: "cogs", label: "Cost of goods sold", confidence: "high", rx: /cost\s+of\s+(goods\s+sold|materials\s+consumed|sales|revenue)/i },
  { key: "cogs", label: "Cost of goods sold", confidence: "medium", rx: /purchases?\s+of\s+stock[-\s]in[-\s]trade/i },

  { key: "operatingProfit", label: "Operating profit (EBIT)", confidence: "high", rx: /\b(ebit|operating\s+(profit|income))\b/i },
  { key: "operatingProfit", label: "Operating profit (EBIT)", confidence: "medium", rx: /profit\s+before\s+(interest\s+and\s+)?tax/i },

  { key: "interest", label: "Interest expense", confidence: "high", rx: /\b(finance\s+cost|interest\s+(expense|cost))/i },

  { key: "netProfit", label: "Net profit", confidence: "high", rx: /profit\s+(for\s+the\s+(year|period)|after\s+tax)/i },
  { key: "netProfit", label: "Net profit", confidence: "medium", rx: /\bnet\s+(profit|income)\b/i },

  { key: "currentAssets", label: "Current assets", confidence: "high", rx: /total\s+current\s+assets/i },
  { key: "inventory", label: "Inventory", confidence: "high", rx: /\b(inventor(y|ies)|stock[-\s]in[-\s]trade)\b/i },
  { key: "receivables", label: "Trade receivables", confidence: "high", rx: /(trade\s+receivables?|accounts?\s+receivable|sundry\s+debtors)/i },
  { key: "currentLiabilities", label: "Current liabilities", confidence: "high", rx: /total\s+current\s+liabilit/i },

  { key: "totalDebt", label: "Total debt", confidence: "high", rx: /\b(total\s+)?borrowings?\b/i },
  { key: "totalDebt", label: "Total debt", confidence: "medium", rx: /\b(long[-\s]term\s+debt|total\s+debt)\b/i },

  { key: "equity", label: "Shareholders' equity", confidence: "high", rx: /total\s+equity|shareholders?[’']?\s+funds?|net\s+worth/i },
  { key: "equity", label: "Shareholders' equity", confidence: "medium", rx: /\bother\s+equity\b/i },

  { key: "totalAssets", label: "Total assets", confidence: "high", rx: /total\s+assets/i },
];

/**
 * First number on the line. Handles 1,23,456.78 (Indian grouping), 1,234,567,
 * bracketed negatives, and a leading currency symbol.
 */
function firstNumber(line: string): number | null {
  // strip a leading note/serial column like "2.14" or "(a)"
  const cleaned = line.replace(/^\s*[\d.]{1,6}[\s)]+/, " ").replace(/\((\s*\d)/g, "(-$1");
  const m = cleaned.match(/-?\(?\s*(?:₹|rs\.?|inr)?\s*-?\d[\d,]*(?:\.\d+)?\)?/i);
  if (!m) return null;

  let raw = m[0].replace(/[₹,\s]/g, "").replace(/rs\.?|inr/gi, "");
  let negative = false;
  if (raw.startsWith("(") || raw.includes("(-")) negative = true;
  raw = raw.replace(/[()]/g, "");
  if (raw.startsWith("-")) {
    negative = true;
    raw = raw.slice(1);
  }

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}

export function extractFigures(text: string): Match[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 3 && /\d/.test(l));

  const found = new Map<keyof Figures, Match>();

  for (const { key, label, rx, confidence } of PATTERNS) {
    if (found.has(key)) continue;
    for (const line of lines) {
      if (!rx.test(line)) continue;
      const value = firstNumber(line);
      if (value === null || value === 0) continue;
      found.set(key, { key, label, value: Math.abs(value), source: line.slice(0, 120), confidence });
      break;
    }
  }

  return [...found.values()];
}

/** Reads a PDF's text layer. pdf.js is loaded only when this is called. */
export async function pdfToText(file: File): Promise<{ text: string; pages: number }> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;

  let text = "";
  const pages = Math.min(doc.numPages, 40); // annual reports are long; the statements are early
  for (let i = 1; i <= pages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();

    // rebuild lines by Y position — PDFs emit text as scattered runs
    const rows = new Map<number, { x: number; s: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const bucket = rows.get(y) ?? [];
      bucket.push({ x: item.transform[4], s: item.str });
      rows.set(y, bucket);
    }

    const ordered = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    for (const [, runs] of ordered) {
      text += runs.sort((a, b) => a.x - b.x).map((r) => r.s).join(" ") + "\n";
    }
  }

  return { text, pages: doc.numPages };
}
