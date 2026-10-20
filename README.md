# Saarukesh K — macOS Portfolio

A portfolio built as a working macOS desktop: a window manager, a magnifying
dock, Launchpad, Mission Control, Spotlight and an interactive terminal.

Next.js 16 · React 19 · TypeScript · Tailwind v4 · Motion · Zustand

---

## Run it

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm start       # serve the production build
```

## Apps

| App | What it shows |
|---|---|
| **About Me** | Bio, skills, certifications, experience, education, volunteering |
| **Projects** | The BDL financial analysis, with a detail view |
| **Numbers** | Your ratio tables and trend charts — reads `src/content/financials.ts` |
| **Calendar** | Your journey as a timeline — reads `timeline` in `profile.ts` |
| **Photos** | Certificates and marksheets — reads `src/content/gallery.ts` |
| **Résumé** | The full CV, rendered live from your data. ⌘P prints it clean |
| **Contact** | A Mail-style compose window that hands off to `mailto:` |
| **Terminal** | `help`, `education`, `certifications`, `cat <project>`, `neofetch`… |
| **Calculator** | Works, including the keyboard |
| **Wanted** | A One Piece bounty poster. Not in the dock — find it in Launchpad |
| **System Settings** | Appearance, wallpapers, shortcuts |

## The files you edit

Everything is data-driven. You should never need to touch a component.

| File | Holds |
|---|---|
| `src/content/profile.ts` | Name, bio, socials, skills, certifications, projects, experience, education, volunteering, **timeline** |
| `src/content/financials.ts` | The Numbers app's tables. Currently `null` — fill it from your BDL spreadsheet |
| `src/content/gallery.ts` | The Photos app's certificates |

Optional files:

- `public/avatar.jpg` — a square photo, then set `avatar: "/avatar.jpg"` in `profile`.
  Left empty, About shows your initials.
- `public/certificates/*` — the images `gallery.ts` points at.
- `public/resume.pdf` — see **Producing the PDF** below.

## Producing the PDF

The download button currently hands over the `.docx`. Recruiters expect PDF:

1. Open the **Résumé** window.
2. Press **⌘P** → **Save as PDF**. The print stylesheet strips the desktop
   chrome so only the paper prints.
3. Save it to `public/resume.pdf` and set `resumeFile = "/resume.pdf"` in
   `profile.ts`. The button label follows the file type automatically.

This keeps the PDF identical to what the site shows, so the two can't drift.

## Shortcuts

| Key | Does |
|---|---|
| ⌘K | Spotlight |
| F4 | Launchpad |
| F3 | Mission Control |
| ⌘/ | Shortcut list |
| ⌘W / ⌘M | Close / minimise the focused window |
| ⌘P | Print the résumé |
| Esc | Dismiss any overlay |

## Deploying

The site is fully static — no env vars, no database.

```bash
git add -A && git commit -m "Portfolio"
git remote add origin https://github.com/saarukesh2005/portfolio.git
git push -u origin main
```

Then import the repo at [vercel.com/new](https://vercel.com/new) and accept the
defaults. Vercel detects Next.js on its own.

## Adding things

### A new app

1. Write `src/components/apps/MyApp.tsx` — a plain component, it fills the window.
2. Add an entry to `APPS` in `src/lib/apps.tsx`:

```tsx
{
  id: "myapp",
  name: "My App",
  icon: <MyIcon />,
  Component: MyApp,
  size: { w: 760, h: 520 },
  dock: true,
  desktop: false,
  secondaryDock: true,   // drops off the dock on phones
  keywords: ["searchable", "terms"],
}
```

It now appears in the dock, Launchpad, Spotlight and `open myapp` in the terminal.

### A wallpaper

1. Drop the image in `public/wallpapers/`.
2. Add a variable and a selector in `src/app/globals.css`:

```css
:root { --wp-foo: url("/wallpapers/foo.webp"); }
:root[data-wallpaper="foo"] { --wallpaper: var(--wp-foo); }
```

3. Add an entry to `WALLPAPERS` in `src/lib/store.ts`. Set `photo: true` for a
   photograph — that puts a frosted panel behind the desktop name so white text
   does not vanish into a bright image.

The id must be lowercase letters only (`foo`, not `foo2`) — the script in
`layout.tsx` that applies a saved wallpaper before first paint validates it
against that pattern.

## Known dev quirk

**Edits to `src/app/globals.css` do not hot-reload** — Turbopack's CSS watcher
misses them in this Next version. Restart `npm run dev` after changing that file.
Everything else hot-reloads normally.

## Accessibility note

The desktop is a canvas, so the real content also ships as plain semantic markup
for crawlers and screen readers (`SeoContent` in `src/app/page.tsx`). It reads
from `profile.ts`, so it stays in sync on its own.
