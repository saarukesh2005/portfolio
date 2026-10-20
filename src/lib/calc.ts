/**
 * Spotlight's calculator.
 *
 * A hand-written recursive-descent parser rather than `eval` — this evaluates
 * whatever a visitor types, and `eval` on untrusted input is never worth it
 * even client-side.
 */

export type CalcResult = {
  /** the formatted answer */
  value: string;
  /** what was understood, echoed back so the reading is unambiguous */
  reading: string;
  kind: "arithmetic" | "percent" | "finance";
};

/* ── tokeniser ──────────────────────────────────────────────────────── */

type Token = { t: "num"; v: number } | { t: "op"; v: string } | { t: "paren"; v: "(" | ")" };

function tokenise(src: string): Token[] | null {
  const out: Token[] = [];
  let i = 0;
  const s = src.replace(/,/g, "").replace(/×/g, "*").replace(/÷/g, "/");

  while (i < s.length) {
    const c = s[i];
    if (c === " ") {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const n = Number(s.slice(i, j));
      if (!Number.isFinite(n)) return null;
      out.push({ t: "num", v: n });
      i = j;
      continue;
    }
    if ("+-*/^".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "(" || c === ")") {
      out.push({ t: "paren", v: c });
      i++;
      continue;
    }
    return null; // anything else means this isn't a sum
  }
  return out.length ? out : null;
}

/* ── parser ─────────────────────────────────────────────────────────── */

function parse(tokens: Token[]): number | null {
  let pos = 0;
  const peek = () => tokens[pos];

  function expr(): number | null {
    let left = term();
    if (left === null) return null;
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "+" || t.v === "-")) {
        pos++;
        const right = term();
        if (right === null) return null;
        left = t.v === "+" ? left + right : left - right;
      } else return left;
    }
  }

  function term(): number | null {
    let left = power();
    if (left === null) return null;
    for (;;) {
      const t = peek();
      if (t?.t === "op" && (t.v === "*" || t.v === "/")) {
        pos++;
        const right = power();
        if (right === null) return null;
        if (t.v === "/" && right === 0) return null;
        left = t.v === "*" ? left * right : left / right;
      } else return left;
    }
  }

  function power(): number | null {
    const base = unary();
    if (base === null) return null;
    const t = peek();
    if (t?.t === "op" && t.v === "^") {
      pos++;
      const exp = power();
      if (exp === null) return null;
      return Math.pow(base, exp);
    }
    return base;
  }

  function unary(): number | null {
    const t = peek();
    if (t?.t === "op" && t.v === "-") {
      pos++;
      const v = unary();
      return v === null ? null : -v;
    }
    return primary();
  }

  function primary(): number | null {
    const t = peek();
    if (!t) return null;
    if (t.t === "num") {
      pos++;
      return t.v;
    }
    if (t.t === "paren" && t.v === "(") {
      pos++;
      const v = expr();
      const close = peek();
      if (close?.t !== "paren" || close.v !== ")") return null;
      pos++;
      return v;
    }
    return null;
  }

  const result = expr();
  return pos === tokens.length ? result : null;
}

/* ── formatting ─────────────────────────────────────────────────────── */

const fmt = (n: number, dp = 2) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: dp });

const money = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ── finance helpers ────────────────────────────────────────────────── */

function finance(q: string): CalcResult | null {
  const parts = q.trim().toLowerCase().split(/\s+/);
  const [cmd, ...rest] = parts;
  const n = rest.map((x) => Number(x.replace(/[,%₹]/g, "")));
  const ok = (count: number) => n.length >= count && n.slice(0, count).every(Number.isFinite);

  if ((cmd === "cagr" || cmd === "growth") && ok(3)) {
    const [start, end, years] = n;
    if (start <= 0 || years <= 0) return null;
    const r = (Math.pow(end / start, 1 / years) - 1) * 100;
    return {
      kind: "finance",
      value: fmt(r, 2) + "%",
      reading: `CAGR from ${fmt(start)} to ${fmt(end)} over ${fmt(years)} years`,
    };
  }

  if (cmd === "emi" && ok(3)) {
    const [principal, annualRate, years] = n;
    const i = annualRate / 12 / 100;
    const months = years * 12;
    if (months <= 0) return null;
    const emi = i === 0 ? principal / months : (principal * i * Math.pow(1 + i, months)) / (Math.pow(1 + i, months) - 1);
    return {
      kind: "finance",
      value: money(emi) + " / month",
      reading: `EMI on ${money(principal)} at ${fmt(annualRate)}% for ${fmt(years)} years · total ${money(emi * months)}`,
    };
  }

  if (cmd === "sip" && ok(3)) {
    const [monthly, annualRate, years] = n;
    const i = annualRate / 12 / 100;
    const months = years * 12;
    const fv = i === 0 ? monthly * months : monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    return {
      kind: "finance",
      value: money(fv),
      reading: `SIP of ${money(monthly)}/month at ${fmt(annualRate)}% for ${fmt(years)} years · invested ${money(monthly * months)}`,
    };
  }

  if ((cmd === "ci" || cmd === "compound") && ok(3)) {
    const [principal, annualRate, years] = n;
    const fv = principal * Math.pow(1 + annualRate / 100, years);
    return {
      kind: "finance",
      value: money(fv),
      reading: `${money(principal)} at ${fmt(annualRate)}% compounded yearly for ${fmt(years)} years · interest ${money(fv - principal)}`,
    };
  }

  return null;
}

/* ── entry point ────────────────────────────────────────────────────── */

export function calculate(raw: string): CalcResult | null {
  const q = raw.trim();
  if (!q) return null;

  const fin = finance(q);
  if (fin) return fin;

  // "15% of 48000"
  const pctOf = q.match(/^([\d.,]+)\s*%\s*of\s+([\d.,]+)$/i);
  if (pctOf) {
    const p = Number(pctOf[1].replace(/,/g, ""));
    const base = Number(pctOf[2].replace(/,/g, ""));
    if (Number.isFinite(p) && Number.isFinite(base))
      return { kind: "percent", value: fmt((p / 100) * base), reading: `${fmt(p)}% of ${fmt(base)}` };
  }

  // "48000 + 15%" / "48000 - 15%"
  const pctAdj = q.match(/^([\d.,]+)\s*([+-])\s*([\d.,]+)\s*%$/);
  if (pctAdj) {
    const base = Number(pctAdj[1].replace(/,/g, ""));
    const p = Number(pctAdj[3].replace(/,/g, ""));
    if (Number.isFinite(base) && Number.isFinite(p)) {
      const v = pctAdj[2] === "+" ? base * (1 + p / 100) : base * (1 - p / 100);
      return { kind: "percent", value: fmt(v), reading: `${fmt(base)} ${pctAdj[2]} ${fmt(p)}%` };
    }
  }

  // "120 to 150 change" → percentage change
  const change = q.match(/^([\d.,]+)\s*(?:to|→|->)\s*([\d.,]+)$/i);
  if (change) {
    const a = Number(change[1].replace(/,/g, ""));
    const b = Number(change[2].replace(/,/g, ""));
    if (Number.isFinite(a) && Number.isFinite(b) && a !== 0) {
      const pc = ((b - a) / a) * 100;
      return {
        kind: "percent",
        value: (pc >= 0 ? "+" : "") + fmt(pc, 2) + "%",
        reading: `change from ${fmt(a)} to ${fmt(b)}`,
      };
    }
  }

  // plain arithmetic — needs at least one operator, or "5" would be a "sum"
  if (!/[+\-*/^×÷]/.test(q)) return null;
  const tokens = tokenise(q);
  if (!tokens) return null;
  const value = parse(tokens);
  if (value === null || !Number.isFinite(value)) return null;

  return { kind: "arithmetic", value: fmt(value, 4), reading: q };
}
