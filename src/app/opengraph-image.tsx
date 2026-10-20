import { ImageResponse } from "next/og";
import { profile, certifications } from "@/content/profile";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Rendered at build time by Satori, which supports only flexbox and a subset
 * of CSS — hence the explicit display:flex on every container.
 */
export default function OpengraphImage() {
  const chips = [
    ...certifications.filter((c) => c.status === "Completed").map((c) => c.name),
    profile.location,
  ].slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 86px",
          background: "linear-gradient(140deg, #14102b 0%, #0b1229 48%, #0a1b2e 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 34 }}>
          <div
            style={{
              display: "flex",
              width: 16,
              height: 16,
              borderRadius: 16,
              background: "#34d399",
            }}
          />
          <div style={{ display: "flex", fontSize: 26, color: "rgba(255,255,255,.62)", letterSpacing: 1 }}>
            OPEN TO WORK · FINANCIAL SERVICES
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2.5 }}>
          {profile.name}
        </div>

        <div style={{ display: "flex", fontSize: 38, color: "rgba(255,255,255,.72)", marginTop: 14 }}>
          {profile.role}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 44 }}>
          {chips.map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.2)",
                background: "rgba(255,255,255,.07)",
                fontSize: 25,
                color: "rgba(255,255,255,.85)",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
