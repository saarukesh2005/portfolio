import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card is the most-seen surface of the whole site: it renders in
 * every LinkedIn and Instagram post, including for the people who never
 * click. So it shows the product rather than describing it — a drawn
 * Ratio Analyser window beside the name.
 *
 * The figures are the real output of computeRatios(SAMPLE), not invented,
 * so the card cannot contradict what the tool prints.
 *
 * Rendered at build time by Satori, which supports only flexbox and a
 * subset of CSS — hence the explicit display:flex on every container.
 */

const ROWS: [string, string][] = [
  ["Return on Equity", "17.9%"],
  ["Current Ratio", "1.84×"],
  ["Debt to Equity", "0.36×"],
  ["Interest Coverage", "8.2×"],
];

const DOTS = ["#ff5f57", "#febc2e", "#28c840"];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 76px",
          background: "linear-gradient(140deg, #14102b 0%, #0b1229 48%, #0a1b2e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        {/* left: who */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
            <div style={{ display: "flex", width: 14, height: 14, borderRadius: 14, background: "#34d399" }} />
            <div style={{ display: "flex", fontSize: 23, color: "rgba(255,255,255,.62)", letterSpacing: 1 }}>
              OPEN TO WORK · FINANCIAL SERVICES
            </div>
          </div>

          <div style={{ display: "flex", fontSize: 78, fontWeight: 700, letterSpacing: -2.5 }}>
            {profile.name}
          </div>

          <div style={{ display: "flex", fontSize: 29, color: "rgba(255,255,255,.72)", marginTop: 12 }}>
            {profile.role}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 25,
              lineHeight: 1.45,
              color: "rgba(255,255,255,.55)",
              marginTop: 30,
              maxWidth: 560,
            }}
          >
            Finance tools that actually compute — inside a macOS desktop in the browser.
          </div>
        </div>

        {/* right: the product */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 436,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,.16)",
            background: "#1d1f26",
            overflow: "hidden",
            boxShadow: "0 30px 70px rgba(0,0,0,.55)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "14px 18px",
              background: "#2a2d35",
              borderBottom: "1px solid rgba(255,255,255,.1)",
            }}
          >
            {DOTS.map((c) => (
              <div key={c} style={{ display: "flex", width: 12, height: 12, borderRadius: 12, background: c }} />
            ))}
            <div style={{ display: "flex", flex: 1, justifyContent: "center", fontSize: 18, color: "rgba(255,255,255,.72)" }}>
              Ratio Analyser
            </div>
            <div style={{ display: "flex", width: 45 }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", padding: "8px 18px 16px" }}>
            {ROWS.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "15px 0",
                  borderBottom: "1px solid rgba(255,255,255,.07)",
                }}
              >
                <div style={{ display: "flex", fontSize: 21, color: "rgba(255,255,255,.7)" }}>{label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ display: "flex", fontSize: 23, fontWeight: 600 }}>{value}</div>
                  <div style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: "#34d399" }} />
                </div>
              </div>
            ))}
            <div style={{ display: "flex", fontSize: 16, color: "rgba(255,255,255,.38)", marginTop: 15 }}>
              Drop in a PDF balance sheet · 12 ratios
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
