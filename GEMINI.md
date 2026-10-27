# LMS Diagnostik — agent handoff

Client project. A learning system built around a **three-tier diagnostic test**. The admin types only
an *indicator* (a learning objective); AI generates the questions, 4 answer options and 4 reason
options. For each question the student picks (1) an answer, (2) a reason, (3) **yakin / tidak yakin**
(sure / not sure). Teachers see per-student diagnosis (e.g. misconception). Any subject, not just one.
Roles and pages: student (dashboard, quiz, history, profile) · teacher (dashboard, student detail with
diagnosis, profile) · admin (generate set, set history/edit, user management) · login.

State as of 2026-10-27.

## ⚠ Branch Structure & Code Location
- **`fullstack` branch**:
  - Contains complete fullstack implementation (Phases 1–5).
  - Merged both historical remote branches (`origin/claude/adoring-brown-4qkg0d` and `origin/main-0oo446`).
  - Includes all 5 fixes: `auth.users` NULL text columns fix, AI retry on 429/503 with exponential backoff and logging, preserved form fields on failure, shuffled AI answer positions, and the Admin-API seed script (`scripts/seed.mjs`).
  - Safely preserved for backend / DB deployment.
- **`main` branch (Active Frontend)**:
  - Rebuilt student quiz interface from scratch with a **mobile-first neo-brutalist aesthetic** inspired by the HYDE project (`D:\proj\HYDE`).
  - `proxy.ts` (Next.js 16) has a safe bypass guard returning `NextResponse.next()` when `NEXT_PUBLIC_SUPABASE_URL` is unset, enabling standalone frontend UI development and preview without throwing 500 errors.
  - Root route `/` redirects automatically to `/quiz`.

## Design System & Aesthetic (Locked Decisions)
- **Palette (Ferrari Red + Monochrome)**:
  - Background: Warm light `#FAFAFA` / Pitch black `#09090B`.
  - Surface: Clean white `#FFFFFF` / Deep slate `#121215`.
  - Accent: **Ferrari Red (Rosso Corsa `#FF2800`)** across both light and dark modes with `#D40000` hover. Zero pink/magenta bias (unlike TikTok's rose red).
  - Contrast Text on Accent: Crisp pure white `#FFFFFF` (`--color-accent-contrast`).
  - Borders: Crisp `1.5px` - `2.5px` solid (`#0A0A0A` light / `#FAFAFA` dark).
- **Tactile Neo-Brutalist Shadows & Dither**:
  - Overshadow is selective: subtle 3px shadow only on currently active question card, and 4px Ferrari red shadow (`--shadow-boxy-accent`) on selected options. Other containers stay clean and flat (`box-shadow: none`).
  - High-contrast 2x2 pixel checkerboard SVG dither patterns (`--dither-svg`, `--dither-svg-accent`, `--dither-svg-solid`) applied as textured overlays on active and selected elements.
- **Mechanical Tactile Clicks**:
  - `.boxy-pressable-sm` / `.boxy-pressable-md` / `.boxy-btn` use snappy `transition: transform 0.08s ease, box-shadow 0.08s ease`.
  - On press (`:active`): amblas ke dalam (`translate(2px, 2px)` or `translate(3.5px, 3.5px)` with zero shadow).
  - Action triggers immediately upon release without artificial delays.
- **Root Overflow Rule**:
  - `html, body` uses `overflow-x: clip;` instead of `overflow-x: hidden;`. This is critical: `overflow-x: clip` prevents horizontal scroll without creating a scroll container that breaks CSS `position: sticky; top: 0;`.

## Key Components Built & Verified
1. **Sticky Header Navbar** (`app/quiz/page.tsx`):
   - Full-width sticky bar (`position: sticky; top: 0; zIndex: 50; width: 100%; border-bottom: 1.5px solid var(--color-border)`).
   - Holds `[ FISIKA ]` badge on left, and `[ 03 | 10 ▾ ]` progress button, theme toggler, and `[ SELESAI ➔ ]` button on right.
   - Pinned securely to the top of the viewport when scrolling, with questions sliding behind it.
2. **Direction-Aware Deck Slide Navigation** (`app/globals.css` + `app/quiz/page.tsx`):
   - `handleNext`: sets `direction = "forward"` (`slideInFromRight` 0.26s cubic-bezier).
   - `handlePrev`: sets `direction = "backward"` (`slideInFromLeft` 0.26s cubic-bezier).
   - Grid modal jumps detect index delta to choose forward/backward automatically.
   - Sticky navbar and bottom navigation stay stationary while only the question deck slides.
3. **Two-Stage Tier Unlock Animation**:
   - Stage 1: `.tier-box-expand` scales container from top (0.36s cubic-bezier).
   - Stage 2: `.tier-content-reveal` fades and slides inner content in after 0.34s delay (0.28s).
4. **`components/ThemeToggler.tsx`**:
   - MagicUI View Transitions API with rectangular/box reveal (`clip-path: inset(...)`) expanding outward from button.
   - 8-bit pixel sun and moon SVG icons.
   - Snappy 250ms duration with zero click lag.
5. **`components/BoxyProgressBar.tsx` & `components/QuestionProgressModal.tsx`**:
   - Header trigger button `[ 03 | 10 ▾ ]` with instant click response.
   - Grid modal popup with staggered pop-in animation (`idx * 24ms`), category count legend, and progress bar.
6. **`components/ScoreSwipeOverlay.tsx`**:
   - Fullscreen swipe-up overlay (`translateY(100%) → 0`) on quiz completion with `NumberTicker` animated score count-up.
   - 4-category diagnostic summary: Paham Konsep, Miskonsepsi, Lucky Guess, Tidak Paham.
   - Smooth swipe-down exit animation (`translateY(100%)` 0.40s) on clicking `SELESAI & KELUAR ➔` or `ULAS JAWABAN`.

## Remaining Next Steps
- Apply this established design language to the remaining views:
  - Login Screen (`docs/ui-reference/Main.dc.html`)
  - Student Dashboard (`docs/ui-reference/StudentDashboard.dc.html`)
  - Teacher Detail Dashboard (`docs/ui-reference/TeacherDetail.dc.html`)
  - Admin Generate Screen (`docs/ui-reference/AdminGenerate.dc.html`)
- Integrate UI with backend Server Actions from `fullstack` branch when ready for live Supabase testing.
- Scripts: `npm run dev` (runs Turbopack on port 3000), `npm run typecheck`, `npm run test` (`vitest`).
