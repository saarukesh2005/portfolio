import type { ReactNode } from "react";

/* Rounded-squircle tile used by every app icon. */
function Tile({
  children,
  from,
  to,
  className = "",
}: {
  children: ReactNode;
  from: string;
  to: string;
  className?: string;
}) {
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}
      style={{
        borderRadius: "23%",
        backgroundImage: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), inset 0 -1px 0 rgba(0,0,0,.25), 0 6px 14px rgba(0,0,0,.35)",
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-40"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,.55), transparent)" }}
      />
      {children}
    </div>
  );
}

const G = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 24 24" className="relative h-[58%] w-[58%]" fill="none" stroke="white" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/**
 * Luffy under the straw hat — the About Me icon.
 * Drawn so the two things that carry recognition at 50px in the dock, the hat
 * silhouette and the grin, stay bold; the scar and tooth lines are texture
 * that only resolves at larger sizes.
 */
export function LuffyIcon() {
  const TOOTH_X = [18.8, 21.4, 24, 26.6, 29.2];

  return (
    <Tile from="#f04444" to="#b01717">
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <defs>
          <linearGradient id="luffy-straw" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f3cf6a" />
            <stop offset="100%" stopColor="#d9a63c" />
          </linearGradient>
          <linearGradient id="luffy-brim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8bf55" />
            <stop offset="100%" stopColor="#c9962f" />
          </linearGradient>
          <clipPath id="luffy-grin">
            <path d="M15.8 33.2C19.6 31.9 28.4 31.9 32.2 33.2C31.7 38.4 28.4 40.4 24 40.4C19.6 40.4 16.3 38.4 15.8 33.2Z" />
          </clipPath>
        </defs>

        <g stroke="#17110c" strokeLinejoin="round" strokeLinecap="round">
          {/* ears */}
          <ellipse cx="11.6" cy="32" rx="2.6" ry="3.4" fill="#f3a877" strokeWidth="1.1" />
          <ellipse cx="36.4" cy="32" rx="2.6" ry="3.4" fill="#f3a877" strokeWidth="1.1" />

          {/* face */}
          <ellipse cx="24" cy="31.2" rx="12.4" ry="11.4" fill="#fcc99c" strokeWidth="1.25" />

          {/* hair poking out below the brim */}
          <g fill="#17110c" strokeWidth="0.9">
            <path d="M13.1 28.4C12.4 32.6 13.4 35.8 15.3 37.9C14.4 34.2 14.9 30.8 16.7 28.2Z" />
            <path d="M34.9 28.4C35.6 32.6 34.6 35.8 32.7 37.9C33.6 34.2 33.1 30.8 31.3 28.2Z" />
            <path d="M18.6 28.6L19.9 31.6L21.1 28.5Z" />
            <path d="M27.1 28.5L28.3 31.6L29.6 28.6Z" />
          </g>

          {/* scar under the eye */}
          <g stroke="#17110c" strokeWidth="0.95" fill="none">
            <path d="M31 30.2V32.6" />
            <path d="M29.9 30.8H32.1" />
            <path d="M29.9 32H32.1" />
          </g>

          {/* grin */}
          <path
            d="M15.8 33.2C19.6 31.9 28.4 31.9 32.2 33.2C31.7 38.4 28.4 40.4 24 40.4C19.6 40.4 16.3 38.4 15.8 33.2Z"
            fill="#fdf6df"
            strokeWidth="1.35"
          />
          <g clipPath="url(#luffy-grin)" stroke="#17110c" strokeWidth="0.95">
            {TOOTH_X.map((x) => (
              <path key={x} d={`M${x} 32.1V40.8`} />
            ))}
          </g>

          {/* hat: brim, then crown on top of it, then the band */}
          <ellipse cx="24" cy="25.4" rx="20.6" ry="5.1" fill="url(#luffy-brim)" strokeWidth="1.3" />
          <path
            d="M11.2 25.6C11.2 14.3 17.0 8.6 24 8.6C31 8.6 36.8 14.3 36.8 25.6Z"
            fill="url(#luffy-straw)"
            strokeWidth="1.3"
          />
          <path
            d="M11.25 21.4C16.8 24 31.2 24 36.75 21.4L36.8 25.4C31.2 28 16.8 28 11.2 25.4Z"
            fill="#e0322c"
            strokeWidth="1.2"
          />

          {/* straw weave — vanishes harmlessly at dock size, earns its keep large */}
          <g stroke="#9a7320" strokeWidth="0.78" opacity="0.75" fill="none">
            <path d="M5.4 25.7L8.0 25.1" />
            <path d="M7.2 27.4L9.8 26.8" />
            <path d="M40.0 25.1L42.6 25.7" />
            <path d="M38.2 26.8L40.8 27.4" />
            <path d="M16.6 28.7L19.0 29.1" />
            <path d="M22.8 29.4L25.4 29.4" />
            <path d="M29.2 29.1L31.6 28.7" />
            <path d="M17.6 16.8C18.6 14.3 20.5 12.5 22.8 11.8" />
            <path d="M29.4 14.8C30.7 16.6 31.5 18.9 31.8 21.2" />
          </g>
        </g>
      </svg>
    </Tile>
  );
}

export function ProjectsIcon() {
  return (
    <Tile from="#a78bfa" to="#6d28d9">
      <svg viewBox="0 0 24 24" className="relative h-[56%] w-[56%]" fill="#fff">
        {[5, 12, 19].map((y) => [5, 12, 19].map((x) => <rect key={`${x}-${y}`} x={x - 2.4} y={y - 2.4} width="4.8" height="4.8" rx="1.6" opacity={0.95} />))}
      </svg>
    </Tile>
  );
}

export function TerminalIcon() {
  return (
    <Tile from="#4b5563" to="#0b0f14">
      <svg viewBox="0 0 24 24" className="relative h-[56%] w-[56%]" fill="none" stroke="#6ee7a8" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 7.5 9.5 12 5 16.5" />
        <path d="M12.5 16.5H19" />
      </svg>
    </Tile>
  );
}

export function ResumeIcon() {
  return (
    <Tile from="#fdfdfd" to="#d7dae0">
      <svg viewBox="0 0 24 24" className="relative h-[60%] w-[60%]" fill="none" stroke="#e0533d" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H7a1.6 1.6 0 0 0-1.6 1.6v14.8A1.6 1.6 0 0 0 7 21h10a1.6 1.6 0 0 0 1.6-1.6V7.6Z" />
        <path d="M14 3v4.6h4.6" />
        <path d="M8.6 12.6h6.8M8.6 16h4.6" stroke="#8b95a3" />
      </svg>
    </Tile>
  );
}

export function MailIcon() {
  return (
    <Tile from="#63b8ff" to="#0f62d6">
      <G>
        <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.6" />
        <path d="m3.4 7.4 8.6 6 8.6-6" />
      </G>
    </Tile>
  );
}

export function SettingsIcon() {
  return (
    <Tile from="#a7b0be" to="#3c434e">
      <svg viewBox="0 0 48 48" className="relative h-[66%] w-[66%]">
        <g fill="#fff" opacity={0.95}>
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="21.4" y="1.5" width="5.2" height="11" rx="2.1" transform={`rotate(${i * 45} 24 24)`} />
          ))}
        </g>
        <circle cx="24" cy="24" r="15.2" fill="#fff" opacity={0.95} />
        <circle cx="24" cy="24" r="6.6" fill="#4b525e" />
      </svg>
    </Tile>
  );
}

export function CalendarIcon() {
  return (
    <Tile from="#fdfdfd" to="#dfe2e8">
      <div className="relative flex h-[78%] w-[72%] flex-col overflow-hidden rounded-[14%]">
        <div className="flex h-[30%] items-center justify-center bg-[#e5453b] text-[26%] font-semibold leading-none text-white">
          <span style={{ fontSize: "min(2.1vw, 9px)" }}>JUN</span>
        </div>
        <div className="flex flex-1 items-center justify-center bg-white font-semibold leading-none text-[#1b1d22]">
          <span style={{ fontSize: "min(5vw, 22px)" }}>26</span>
        </div>
      </div>
    </Tile>
  );
}

export function NumbersIcon() {
  return (
    <Tile from="#7ee08a" to="#1f9e46">
      <svg viewBox="0 0 24 24" className="relative h-[58%] w-[58%]" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round">
        <path d="M4.2 19.4V11M9.4 19.4V6.2M14.6 19.4V13.6M19.8 19.4V8.6" />
      </svg>
    </Tile>
  );
}

export function PhotosIcon() {
  return (
    <Tile from="#ffd36e" to="#f0633f">
      <svg viewBox="0 0 24 24" className="relative h-[58%] w-[58%]" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinejoin="round">
        <rect x="3" y="5.4" width="18" height="13.2" rx="2.4" />
        <circle cx="8.6" cy="10" r="1.5" fill="#fff" stroke="none" />
        <path d="M3.4 16.6 9 11.6l3.4 3 2.6-2.2 5.6 4.6" />
      </svg>
    </Tile>
  );
}

export function CalculatorIcon() {
  return (
    <Tile from="#9aa3b2" to="#3c434e">
      <div className="relative grid h-[72%] w-[62%] grid-cols-4 grid-rows-5 gap-[6%]">
        <span className="col-span-4 rounded-[10%] bg-white/85" />
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="rounded-full bg-white/55" />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <span key={`o${i}`} className="rounded-full bg-[#ff9f0a]" />
        ))}
      </div>
    </Tile>
  );
}

export function WantedIcon() {
  return (
    <Tile from="#efdcae" to="#c2a269">
      <svg viewBox="0 0 24 24" className="relative h-[72%] w-[72%]">
        <rect x="3.6" y="2.6" width="16.8" height="18.8" rx="1" fill="#f6ead0" stroke="#6b4f2a" strokeWidth="1.1" />
        <text x="12" y="8.1" textAnchor="middle" fill="#3c2a16" style={{ font: "bold 4.2px Georgia, serif" }}>
          WANTED
        </text>
        <rect x="6.4" y="9.6" width="11.2" height="7.2" rx="0.6" fill="#d8c295" stroke="#6b4f2a" strokeWidth="0.8" />
        <circle cx="12" cy="12.6" r="1.7" fill="#6b4f2a" />
        <path d="M8.6 16.6c.7-1.7 5.1-1.7 6.8 0Z" fill="#6b4f2a" />
        <text x="12" y="19.8" textAnchor="middle" fill="#3c2a16" style={{ font: "bold 2.9px Georgia, serif" }}>
          DEAD OR ALIVE
        </text>
      </svg>
    </Tile>
  );
}

export function LaunchpadIcon() {
  const dots = ["#ff6b6b", "#ffa94d", "#ffd43b", "#51cf66", "#22b8cf", "#4dabf7", "#9775fa", "#f783ac", "#adb5bd"];
  return (
    <Tile from="#f2f4f8" to="#c9cfdb">
      <div className="relative grid h-[58%] w-[58%] grid-cols-3 gap-[12%]">
        {dots.map((c) => (
          <span key={c} className="rounded-[26%]" style={{ background: c }} />
        ))}
      </div>
    </Tile>
  );
}

/**
 * The crew's ship — the "Join my Crew" icon. Drawn rather than bitmapped so it
 * stays sharp under dock magnification, and so there's no watermark on it.
 * Bold hull, two sails and the Jolly Roger; the rigging detail only resolves
 * at larger sizes.
 */
export function ShipIcon() {
  return (
    <Tile from="#5fc8f5" to="#1264c0">
      <svg viewBox="0 0 48 48" className="relative h-full w-full">
        <g stroke="#17110c" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round">
          {/* masts */}
          <path d="M18.5 29V10.5M31 29V8" stroke="#8a5a2b" strokeWidth="1.8" />

          {/* fore sail, carrying the Jolly Roger */}
          <path d="M18 11.5C13 13.5 10 18 9.5 27.5H18Z" fill="#fdfdfb" />
          <g stroke="none">
            <ellipse cx="13.6" cy="20.2" rx="2.5" ry="2.2" fill="#17110c" />
            <path d="M9.9 17.6C11 16 16.2 16 17.3 17.6Z" fill="#17110c" />
            <circle cx="12.6" cy="19.9" r="0.72" fill="#fdfdfb" />
            <circle cx="14.6" cy="19.9" r="0.72" fill="#fdfdfb" />
            <path d="M12.3 22.4h2.6" stroke="#fdfdfb" strokeWidth="0.75" strokeLinecap="round" />
          </g>

          {/* main sail */}
          <path d="M31.5 9.5C37 12 40 18 40.5 27.5H31.5Z" fill="#fdfdfb" />
          <g stroke="#e0322c" strokeWidth="1.5" fill="none" opacity="0.92">
            <path d="M34 11.6C36.4 14.4 37.9 20.4 38.2 27.5" />
            <path d="M31.9 10.4C33.6 13.6 34.6 20.2 34.8 27.5" />
          </g>

          {/* crow's nest */}
          <path d="M28.6 8.4h4.8l-.9 2.6h-3Z" fill="#e0322c" />

          {/* hull */}
          <path d="M6.5 29.5h35c-1.6 6.4-6.2 9.6-17.5 9.6S8.1 35.9 6.5 29.5Z" fill="#a9682f" />
          <path d="M7.2 29.5h33.6l-.7 3.2H7.9Z" fill="#e0322c" />
          <g stroke="none" fill="#fdfdfb">
            <circle cx="15" cy="31.1" r="1.05" />
            <circle cx="24" cy="31.1" r="1.05" />
            <circle cx="33" cy="31.1" r="1.05" />
          </g>

          {/* figurehead */}
          <path d="M6.6 29.4C4 28.4 2.6 26.6 3.2 24.6c1.8.4 3.1 1.3 3.8 2.6Z" fill="#f5c525" />
        </g>
      </svg>
    </Tile>
  );
}

export function AnalyserIcon() {
  return (
    <Tile from="#5ee6c0" to="#0f8a7e">
      <svg viewBox="0 0 48 48" className="relative h-[64%] w-[64%]" fill="none">
        {/* dial */}
        <path d="M6 32a18 18 0 0 1 36 0" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="5.5" strokeLinecap="round" />
        {/* the "healthy" arc */}
        <path d="M6 32A18 18 0 0 1 17 15.4" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M31 15.4A18 18 0 0 1 42 32" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
        {/* needle */}
        <path d="M24 32 32.5 20.5" stroke="#17352f" strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="24" cy="32" r="3.6" fill="#17352f" />
      </svg>
    </Tile>
  );
}

export function GithubIcon() {
  return (
    <Tile from="#3a3f47" to="#101316">
      <svg viewBox="0 0 24 24" className="relative h-[60%] w-[60%]" fill="#fff">
        <path d="M12 1.8a10.2 10.2 0 0 0-3.23 19.88c.51.1.7-.22.7-.49l-.01-1.9c-2.84.62-3.44-1.2-3.44-1.2-.47-1.19-1.14-1.5-1.14-1.5-.93-.64.07-.63.07-.63 1.03.08 1.57 1.06 1.57 1.06.92 1.57 2.4 1.12 2.99.86.09-.67.36-1.12.65-1.38-2.27-.26-4.65-1.14-4.65-5.06 0-1.12.4-2.03 1.05-2.75-.1-.26-.46-1.3.1-2.7 0 0 .86-.28 2.82 1.05a9.7 9.7 0 0 1 5.14 0c1.96-1.33 2.82-1.05 2.82-1.05.56 1.4.2 2.44.1 2.7.65.72 1.04 1.63 1.04 2.75 0 3.93-2.38 4.8-4.66 5.05.37.32.69.94.69 1.9l-.01 2.81c0 .27.19.6.71.49A10.2 10.2 0 0 0 12 1.8Z" />
      </svg>
    </Tile>
  );
}

export function LinkedinIcon() {
  return (
    <Tile from="#38a5e0" to="#0a5a9c">
      <svg viewBox="0 0 24 24" className="relative h-[56%] w-[56%]" fill="#fff">
        <path d="M6.2 9.4h2.9V19H6.2zM7.65 4.9a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4ZM11 9.4h2.78v1.31h.04c.39-.7 1.34-1.44 2.75-1.44 2.94 0 3.48 1.86 3.48 4.28V19h-2.9v-4.86c0-1.16-.02-2.65-1.66-2.65-1.66 0-1.92 1.26-1.92 2.57V19H11Z" />
      </svg>
    </Tile>
  );
}

export function XIcon() {
  return (
    <Tile from="#2a2a2a" to="#000000">
      <svg viewBox="0 0 24 24" className="relative h-[52%] w-[52%]" fill="#fff">
        <path d="M17.2 3h3.3l-7.2 8.2L21.8 21h-6.6l-4.5-5.9L5.5 21H2.2l7.7-8.8L2.5 3h6.7l4 5.4Zm-1.15 16.1h1.82L8.03 4.82H6.08Z" />
      </svg>
    </Tile>
  );
}

/* ───────── Gomu Gomu no Mi ───────── */

/**
 * Luffy's Devil Fruit. Built to survive being shrunk to 15px in the menu bar
 * and blown up past 60px on the boot screen, so the swirls are drawn with a
 * stroke that stays visible rather than fine detail that turns to mush.
 */
/** Swirl centres tiled across the body, as on the real fruit. */
const GOMU_SWIRLS: [number, number][] = [
  [8.5, 9.5], [12.2, 8.7], [15.9, 9.8],
  [6.4, 13.2], [10.1, 12.7], [13.9, 12.5], [17.4, 13.5],
  [7.8, 16.8], [11.6, 16.5], [15.4, 16.9],
  [9.8, 20.0], [13.7, 19.8],
];

/** Fewer, fatter swirls for menu-bar sizes, where the tiled ones turn to mush. */
const GOMU_SWIRLS_SM: [number, number][] = [
  [9.3, 10.6], [15.0, 11.4], [8.5, 16.4], [14.6, 17.2],
];

export function DevilFruit({
  className = "h-[15px] w-[15px]",
  compact = false,
}: {
  className?: string;
  /** Use at roughly 24px and below. */
  compact?: boolean;
}) {
  // half-circles of shrinking radius, alternating direction — a true spiral
  const swirl = (cx: number, cy: number, radii: number[]) =>
    radii.reduce(
      (d, r, i) => d + `a${r} ${r} 0 0 1 ${i % 2 ? -2 * r : 2 * r} 0`,
      `M${cx - radii[0]} ${cy}`
    );

  const id = compact ? "gomu-sm" : "gomu";
  const spots = compact ? GOMU_SWIRLS_SM : GOMU_SWIRLS;
  const radii = compact ? [2.4, 1.45, 0.65] : [1.85, 1.12, 0.5];

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}-body`} cx="34%" cy="27%" r="80%">
          <stop offset="0%" stopColor="#ef9dff" />
          <stop offset="55%" stopColor="#cb4aee" />
          <stop offset="100%" stopColor="#8d22b4" />
        </radialGradient>
        {/* swirls run right up to the rim on the real fruit, so let them
            overflow and clip to the silhouette */}
        <clipPath id={`${id}-clip`}>
          <circle cx="12" cy="14.3" r="7.7" />
        </clipPath>
      </defs>

      {/* stem: a short upright stalk, then one continuous branch — blunt tip
          up to the right, sweeping left into a coil. That silhouette is what
          makes it read as the Gomu Gomu no Mi even when it is tiny.
          The stalk starts inside the circle so the body, drawn next, hides
          its base and it reads as growing out of the fruit. */}
      <g fill="none" stroke="#45a24b" strokeWidth={compact ? 1.45 : 0.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.0 7.6C12.1 6.2 12.2 5.2 12.4 4.2" />
        <path
          d={
            "M17.5 1.9C15.7 1.9 13.7 2.8 12.4 4.2C11.6 5.0 10.9 5.1 10.1 5.0" +
            // The coil, wound inward from its right-hand side. Turn spacing has
            // to stay wider than the stroke or the turns merge into a blob —
            // which is why the small variant gets a single hook instead.
            (compact ? "a1.9 1.9 0 0 1 -3.8 0" : "a2 2 0 0 1 -4 0a1.05 1.05 0 0 1 2.1 0")
          }
        />
      </g>

      {/* body */}
      <circle cx="12" cy="14.3" r="7.7" fill={`url(#${id}-body)`} />

      <g
        clipPath={`url(#${id}-clip)`}
        fill="none"
        stroke="#6b1a93"
        strokeWidth={compact ? 0.85 : 0.52}
        strokeLinecap="round"
      >
        {spots.map(([cx, cy]) => (
          <path key={`${cx}-${cy}`} d={swirl(cx, cy, radii)} />
        ))}
      </g>

      {/* specular highlight, so it reads as fruit rather than a flat disc */}
      <ellipse cx="8.6" cy="10.0" rx="1.9" ry="1.2" fill="#fff" opacity="0.2" transform="rotate(-28 8.6 10)" />
    </svg>
  );
}

/* ───────── small inline glyphs (not app tiles) ───────── */

export const Glyph = {
  /** Gomu Gomu no Mi — stands in for the  everywhere it used to appear. */
  devilFruit: <DevilFruit className="h-[19px] w-[19px]" compact />,
  search: (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <circle cx="10.6" cy="10.6" r="6.4" />
      <path d="m15.4 15.4 4 4" />
    </svg>
  ),
  control: (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M4 7h7M4 17h12M14 7h6M19 17h1" />
      <circle cx="12.5" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="currentColor">
      <path d="M12 18.4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0-5.6c1.3 0 2.5.5 3.4 1.3l1.5-1.6a7.3 7.3 0 0 0-9.8 0l1.5 1.6a5 5 0 0 1 3.4-1.3Zm0-4.7c2.6 0 5 1 6.8 2.7l1.5-1.6A11.6 11.6 0 0 0 12 5.6 11.6 11.6 0 0 0 3.7 9.2l1.5 1.6A9.6 9.6 0 0 1 12 8.1Z" />
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 28 14" className="h-[13px] w-[26px]" fill="none">
      <rect x="1" y="1.6" width="22" height="10.8" rx="3.2" stroke="currentColor" strokeWidth="1.2" opacity=".55" />
      <rect x="2.8" y="3.4" width="16" height="7.2" rx="2" fill="currentColor" />
      <path d="M24.6 5.4v3.2c1 -.3 1.5 -.9 1.5 -1.6s-.5 -1.3 -1.5 -1.6Z" fill="currentColor" opacity=".55" />
    </svg>
  ),
  external: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4h6v6M20 4 11 13M18 14v5a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 19V8.2A1.6 1.6 0 0 1 5.6 6.6H10" />
    </svg>
  ),
};

/** Small line icons for in-app sidebars. */
const mini = (d: string) => (
  <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export const MiniIcon = {
  person: mini("M12 12.6a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2ZM4.6 20.2a7.4 7.4 0 0 1 14.8 0"),
  spark: mini("M4 17.5v-5M9.3 17.5V7M14.7 17.5v-7.6M20 17.5V5.5"),
  briefcase: mini("M3.4 8.6h17.2v10.2a1.6 1.6 0 0 1-1.6 1.6H5a1.6 1.6 0 0 1-1.6-1.6ZM8.6 8.6V6.2a1.6 1.6 0 0 1 1.6-1.6h3.6a1.6 1.6 0 0 1 1.6 1.6v2.4M3.4 13.2h17.2"),
  cap: mini("M2.6 9.1 12 4.6l9.4 4.5-9.4 4.5ZM6.4 11.3v4.8c0 1.6 2.5 2.9 5.6 2.9s5.6-1.3 5.6-2.9v-4.8"),
  badge: mini("M12 3.4 14.1 7l4.1.9-2.8 3.1.4 4.2-3.8-1.7-3.8 1.7.4-4.2L5.8 7.9 9.9 7ZM8.9 14.6 7.6 20.6l4.4-2.1 4.4 2.1-1.3-6"),
};

export const socialGlyphs: Record<string, ReactNode> = {
  github: <GithubIcon />,
  linkedin: <LinkedinIcon />,
  x: <XIcon />,
  mail: <MailIcon />,
};
