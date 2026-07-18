# LaTeX Studio

[日本語](README.md) | **English**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![MathJax](https://img.shields.io/badge/MathJax-v3-green)](https://www.mathjax.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A web app for composing LaTeX equations with a live preview and exporting them as **high-resolution transparent PNG, self-contained SVG, or vector PDF**. Every equation you write can be logged to the cloud and recalled from any device. A built-in **equation reproduction trainer** helps you internalize LaTeX syntax.

---

## Table of Contents

- [Background & Philosophy](#background--philosophy)
- [Use in Research Workflows](#use-in-research-workflows)
- [Features](#features)
- [Usage](#usage)
- [Architecture](#architecture)
- [Self-Hosting](#self-hosting)
- [Project Structure](#project-structure)
- [License](#license)

---

## Background & Philosophy

In research, you constantly need *just one equation* as a clean image: a formula for a slide, a definition in a poster corner, a derivation pasted into a README. Compiling a full LaTeX document and cropping the output is overkill for this, and online equation editors tend to compromise on image quality, export formats, or both.

LaTeX Studio is designed around a single goal: making the *one-equation workflow* as short as possible.

- **See it as you type** — millisecond-order live preview via MathJax v3, no compile step
- **Output ready for publication** — transparent PNG up to 16x resolution; SVG/PDF stay vector; glyph paths are embedded so files render identically everywhere
- **Equations as an asset** — everything you write can be saved to a cloud database, named, organized, and re-edited from any device with one click
- **Grow with the tool** — a symbol palette for when you forget the syntax, and a training mode for making sure you never do

## Use in Research Workflows

The app is built around three concrete use cases from actual research practice:

**1. Figures for papers and presentations**
Paste transparent PNGs straight from the clipboard into Keynote / PowerPoint / Google Slides or posters. Equation color is adjustable, so dark-themed slides work too. When vector quality matters (e.g. poster printing), export SVG or PDF instead.

**2. Managing equation snippets**
Save frequently used definitions, metrics, and derivations with names, and never wonder "how did I write that again?" History is tied to your Google account, so the same library is available on your lab desktop and your laptop at home.

**3. LaTeX syntax training**
The practice mode ships with 300 built-in problems (100 each across beginner / intermediate / advanced). You reproduce a rendered target equation in LaTeX, and the app auto-grades by **comparing the rendered SVG structure** — not the source string — so visually identical answers count as correct regardless of style. Useful for onboarding junior lab members as well.

## Features

| Feature | Description |
|---|---|
| Live preview | MathJax v3 (`tex-svg-full`) with physics / color / cancel / mhchem extensions; 150 ms debounce |
| Transparent PNG | 2x / 4x / 8x / 16x resolution, fully transparent background |
| SVG export | Self-contained SVG with embedded glyph paths and baked-in color |
| PDF export | Vector PDF via jspdf + svg2pdf.js |
| Clipboard copy | One-click transparent PNG copy for direct pasting into slides |
| Symbol palette | ~100 items in 6 always-visible categories; inserts at cursor, templates auto-place the caret inside braces |
| Cloud history | Supabase (Postgres + RLS): save, rename, delete, one-click restore |
| Google sign-in | OAuth via Supabase Auth; your history is visible only to you |
| Practice mode | 300 problems by difficulty, auto-graded by rendering equivalence, answer reveal, score tracking |
| Responsive layout | Vertical split (input 20% / preview 80%) with a slide-in history drawer; comfortable on narrow windows |

## Usage

### Editor (`/`)

1. Type LaTeX in the top textarea; the preview below renders instantly
2. Click palette buttons to insert at the cursor (templates like `\frac{}{}` move the caret inside the first `{}`)
3. Export from the bottom bar: **Transparent PNG / SVG / PDF / Copy image** (PNG resolution selectable)
4. Sign in with Google to get a **Save** button; saved equations appear in the history drawer (☰, top left)
5. Click a history item to restore it, ✎ to rename, × to delete

### Practice mode (`/practice`)

1. Open **練習** (Practice) from the header and pick a difficulty with the segmented buttons
2. Reproduce the target equation in LaTeX — the moment your rendering matches, you get "✓ 正解!" (Correct)
3. Stuck? **答えを見る** (Show answer). Done? **次の問題 →** (Next problem)

## Architecture

```
┌────────────┐  LaTeX (150ms) ┌──────────────┐  SVG  ┌──────────────────┐
│  textarea   │ ─────────────→ │  MathJax v3   │ ────→ │  Preview (DOM)    │
└────────────┘                 │  tex-svg-full │       └────────┬─────────┘
                               └──────────────┘                │ clone + bake color
                                                      ┌─────────┴──────────┐
                                                      │  Serialize SVG      │
                                                      ├── Blob → <img> → canvas → transparent PNG
                                                      ├── direct download → SVG
                                                      └── svg2pdf.js → vector PDF
┌─────────────────────────────────────────────────────────────┐
│ Supabase:  Google OAuth (Auth) + equations table (RLS)       │
│ Next.js 15 App Router + @supabase/ssr (session management)   │
│ Vercel: auto-deploy on push to main                          │
└─────────────────────────────────────────────────────────────┘
```

Design decisions:

- **`fontCache: "none"`** — MathJax glyph paths are embedded per-SVG, so exported files are fully self-contained
- **Baking `currentColor`** — actual color values are written into the exported clone, preventing color loss across viewers
- **Serverless by construction** — rendering and export happen entirely in the browser; the only backend is Supabase (DB/Auth), keeping running costs within free tiers
- **Graceful degradation** — without Supabase configured, the editor, exports, and practice mode remain fully functional (only history is disabled)

## Self-Hosting

See **[docs/SETUP.md](docs/SETUP.md)** (Japanese) for the full walkthrough: Supabase project, Google OAuth client, and Vercel deployment (~20–30 minutes, free tiers throughout).

To just try it locally:

```bash
git clone https://github.com/RentoYabuki06/latex_formula_wep_app.git
cd latex_formula_wep_app
npm install
npm run dev   # http://localhost:3000 (everything except history works without Supabase)
```

## Project Structure

```
app/
  page.tsx               # Editor
  practice/page.tsx      # Practice mode
  auth/callback/         # OAuth callback
components/
  EquationEditor.tsx     # Editor + preview + export
  SymbolPalette.tsx      # Symbol palette
  HistoryPanel.tsx       # History drawer
  PracticeGame.tsx       # Practice mode core
  AuthButton.tsx         # Sign in / out
lib/
  mathjax.ts             # MathJax loader / renderer
  export.ts              # PNG / SVG / PDF export
  palette.ts             # Palette definitions (6 categories)
  problems.ts            # Practice problems (100 per level)
  db.ts                  # equations CRUD
  supabase/client.ts     # Supabase browser client
supabase/
  schema.sql             # DB schema + RLS
  migrations/            # Migrations for existing DBs
docs/SETUP.md            # Setup guide (Japanese)
```

## License

[MIT](LICENSE) © 2026 Rento Yabuki
