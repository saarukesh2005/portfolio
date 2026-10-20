"use client";

import { useCallback, useEffect, useState } from "react";

type Op = "+" | "−" | "×" | "÷";

const APPLY: Record<Op, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => (b === 0 ? NaN : a / b),
};

function format(v: string) {
  if (v === "Error") return v;
  const [int, dec] = v.split(".");
  const sign = int.startsWith("-") ? "-" : "";
  const digits = sign ? int.slice(1) : int;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return sign + grouped + (dec !== undefined ? "." + dec : "");
}

function Key({
  label,
  onClick,
  tone = "num",
  wide,
  active,
}: {
  label: string;
  onClick: () => void;
  tone?: "num" | "fn" | "op";
  wide?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center rounded-full text-[19px] transition-colors ${
        wide ? "col-span-2 justify-start pl-[26px]" : ""
      } ${
        tone === "op"
          ? active
            ? "bg-white text-[#ff9f0a]"
            : "bg-[#ff9f0a] text-white hover:bg-[#ffb340]"
          : tone === "fn"
            ? "bg-[#a5a5a5] text-black hover:bg-[#bdbdbd]"
            : "bg-[#5a5a5e] text-white hover:bg-[#6d6d72]"
      }`}
      style={{ aspectRatio: wide ? undefined : "1 / 1" }}
    >
      {label}
    </button>
  );
}

export default function CalculatorApp({ active = true }: { active?: boolean }) {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  /** next digit starts a fresh number rather than appending */
  const [fresh, setFresh] = useState(true);

  const digit = useCallback(
    (d: string) => {
      setDisplay((cur) => {
        if (fresh) return d === "." ? "0." : d;
        if (d === "." && cur.includes(".")) return cur;
        if (cur === "0" && d !== ".") return d;
        return cur.length >= 12 ? cur : cur + d;
      });
      setFresh(false);
    },
    [fresh]
  );

  const equals = useCallback(() => {
    if (op === null || stored === null) return;
    const result = APPLY[op](stored, parseFloat(display));
    setDisplay(Number.isFinite(result) ? String(parseFloat(result.toPrecision(12))) : "Error");
    setStored(null);
    setOp(null);
    setFresh(true);
  }, [op, stored, display]);

  const operator = useCallback(
    (next: Op) => {
      const cur = parseFloat(display);
      if (op !== null && stored !== null && !fresh) {
        const result = APPLY[op](stored, cur);
        if (!Number.isFinite(result)) {
          setDisplay("Error");
          setStored(null);
          setOp(null);
          setFresh(true);
          return;
        }
        setStored(result);
        setDisplay(String(parseFloat(result.toPrecision(12))));
      } else {
        setStored(cur);
      }
      setOp(next);
      setFresh(true);
    },
    [display, op, stored, fresh]
  );

  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setFresh(true);
  };

  useEffect(() => {
    // Without this gate the listener is global: every digit typed in the
    // Terminal or the contact form also drives the calculator, and the
    // preventDefault on "/" and Enter swallows those keys site-wide.
    if (!active) return;

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const k = e.key;
      if (/^[0-9]$/.test(k)) digit(k);
      else if (k === ".") digit(".");
      else if (k === "+") operator("+");
      else if (k === "-") operator("−");
      else if (k === "*") operator("×");
      else if (k === "/") { e.preventDefault(); operator("÷"); }
      else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); }
      else if (k === "Escape") clear();
      else if (k === "%") setDisplay((c) => String(parseFloat(c) / 100));
      else if (k === "Backspace") setDisplay((c) => (c.length <= 1 ? "0" : c.slice(0, -1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, digit, operator, equals]);

  return (
    <div className="flex h-full flex-col bg-[#1c1c1e] p-3">
      <div className="flex min-h-[64px] flex-1 items-end justify-end overflow-hidden px-3 pb-3">
        <span
          className="truncate font-light tabular-nums text-white"
          style={{ fontSize: display.length > 9 ? 36 : display.length > 6 ? 46 : 56, lineHeight: 1 }}
        >
          {format(display)}
        </span>
      </div>

      <div className="grid shrink-0 grid-cols-4 gap-2">
        <Key label={stored === null && display === "0" ? "AC" : "C"} tone="fn" onClick={clear} />
        <Key label="+/−" tone="fn" onClick={() => setDisplay((c) => (c.startsWith("-") ? c.slice(1) : c === "0" ? c : "-" + c))} />
        <Key label="%" tone="fn" onClick={() => setDisplay((c) => String(parseFloat(c) / 100))} />
        <Key label="÷" tone="op" active={op === "÷" && fresh} onClick={() => operator("÷")} />

        {["7", "8", "9"].map((d) => <Key key={d} label={d} onClick={() => digit(d)} />)}
        <Key label="×" tone="op" active={op === "×" && fresh} onClick={() => operator("×")} />

        {["4", "5", "6"].map((d) => <Key key={d} label={d} onClick={() => digit(d)} />)}
        <Key label="−" tone="op" active={op === "−" && fresh} onClick={() => operator("−")} />

        {["1", "2", "3"].map((d) => <Key key={d} label={d} onClick={() => digit(d)} />)}
        <Key label="+" tone="op" active={op === "+" && fresh} onClick={() => operator("+")} />

        <Key label="0" wide onClick={() => digit("0")} />
        <Key label="." onClick={() => digit(".")} />
        <Key label="=" tone="op" onClick={equals} />
      </div>
    </div>
  );
}
