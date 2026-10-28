# LMS Diagnostik — agent handoff

Client project. A learning system built around a **three-tier diagnostic test**. The admin types only
an *indicator* (a learning objective); AI generates the questions, 4 answer options and 4 reason
options. For each question the student picks (1) an answer, (2) a reason, (3) **yakin / tidak yakin**
(sure / not sure). Teachers see per-student diagnosis (e.g. misconception). Any subject, not just one.
Roles and pages: student (dashboard, quiz, history, profile) · teacher (dashboard, student detail with
diagnosis, profile) · admin (generate set, set history/edit, user management) · login.

State as of 2026-10-28.

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
- **Palette (Ferrari Red + Monochrome Ergonomics)**:
  - Background: Soft warm paper `#F8F8FA` / Comfortable deep slate `#121215` (avoiding harsh OLED `#000000`).
  - Surface: Pure white `#FFFFFF` / Soft dark slate `#1A1A1F`.
  - Accent: **Ferrari Red (Rosso Corsa `#FF2800`)** across both light and dark modes with `#D40000` hover. Zero pink/magenta bias (unlike TikTok's rose red).
  - Text & Contrast: Deep zinc-900 `#18181B` (light) / Warm platinum `#E8E8ED` (dark) to prevent halation and eye fatigue while maintaining WCAG AAA legibility.
  - Borders: Crisp `1.5px` - `2px` solid (`#18181B` light / `#D4D4D8` dark).
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
7. **`components/StudentBottomNav.tsx` & `components/StudentDashboardView.tsx` (`app/(student)/dashboard/page.tsx`)**:
   - Complete mobile-first neo-brutalist student dashboard UI matching Ferrari Red / HYDE aesthetic.
   - Sticky top header with brand mark `[ LMS DIAGNOSTIK ]`, theme toggle, and profile avatar initials.
   - Time-based greeting ("Selamat pagi/siang/sore/malam") with student name and grade badge.
   - 3-box diagnostic stats row: Completed Sets, Average Score (highlighted with Ferrari Red shadow), and Available Sets.
   - Active in-progress test card banner with progress tracking and direct resume CTA button.
   - Category filter pills (`[ SEMUA ]`, `[ FISIKA ]`, `[ BIOLOGI ]`, etc.) with instant client-side filtering.
   - Question set cards showing subject color dots, question count, learning indicator, score feedback (e.g. `80 / 100`), and dynamic CTA buttons (`MULAI ➔`, `LANJUTKAN ➔`, `ULAS ➔`, `COBA LAGI ↺`). Misconception diagnoses are kept exclusively for teachers and replaced with scores for students.
   - Clean top-header navigation: brand mark `[ LMS DIAGNOSTIK ]` on left, and theme toggle + avatar dropdown button `[ RP ]` (`ProfileDropdown.tsx`) on right. Bottom navigation bar removed to maximize vertical screen real estate.
   - Graceful dual-mode operation: connects to live Supabase backend when env vars exist, or serves rich realistic preview data in standalone dev mode.
8. **`components/ProfileDropdown.tsx`**:
   - Neo-brutalist popover dropdown triggered by the avatar button `[ RP ]`.
   - Displays student name, grade badge, and email at top.
   - Menu items: `PROFIL & KEAMANAN ➔` (navigates to `/profile`) and direct `KELUAR DARI AKUN ➔` (calls `signOut`).
   - Automatically closes on outside clicks or Escape key.
9. **`components/StudentProfileView.tsx` (`app/(student)/profile/page.tsx`)**:
   - Lean, focused neo-brutalist student profile view with top sticky header containing `[ ❮ KEMBALI ]` button and theme toggle.
   - Identity Card: 56px tactile boxy avatar badge, full name, grade badge, and email.
   - Security: Change password form with `.boxy-input` focus effects, validation states, and `[ SIMPAN KATA SANDI ➔ ]`.
   - Logout: Prominent red-accented `[ KELUAR DARI AKUN ➔ ]` button wired to server `signOut` action.
10. **Tactile Page Route Transitions (`app/template.tsx` & `components/PageTransition.tsx`)**:
   - Idiomatic Next.js App Router transition using root `app/template.tsx` that remounts fresh instances on each route navigation (`/dashboard` <-> `/profile` <-> `/quiz`).
   - Snappy neo-brutalist entry animation `@keyframes pageEnter`: subtle 8px vertical lift + fade-in over 0.22s with Apple/Framer snappy deceleration curve `cubic-bezier(0.16, 1, 0.3, 1)`.
   - Zero interference with `position: sticky; top: 0;`: `PageTransition` client wrapper listens to `onAnimationEnd` and removes the transition class once complete, restoring pure `transform: none` on the container so headers adhere natively to viewport scroll.
   - Respects `prefers-reduced-motion: reduce` by disabling animations instantly.
11. **Quiz Clean UI Streamlining (`app/quiz/page.tsx`)**:
   - Removed redundant `TIER 1`, `TIER 2`, `TIER 3` badges across active and locked card headers for clean, distraction-free section headers (`PILIHAN JAWABAN`, `PILIHAN ALASAN`, `TINGKAT KEYAKINAN`).
   - Streamlined question counter badge to show only the current question number (`SOAL 01`), eliminating duplication with the sticky header's progress button `[ 03 | 10 ▾ ]`.
   - Removed `TERPILIH: [*]` badges from section headers since selection is already prominently signaled by the Ferrari Red border, active translation, and dither pattern.
   - Updated placeholder guidance text (`Pilih jawaban di atas...`, `Pilih alasan di atas...`).

## Remaining Next Steps
- Apply this established design language to the remaining views:
  - Login Screen (`docs/ui-reference/Main.dc.html`)
  - Student Review Screen (`/(student)/history/[attemptId]`)
  - Teacher Detail Dashboard (`docs/ui-reference/TeacherDetail.dc.html`)
  - Admin Generate Screen (`docs/ui-reference/AdminGenerate.dc.html`)
- Integrate UI with backend Server Actions from `fullstack` branch when ready for live Supabase testing.
- Scripts: `npm run dev` (runs Turbopack on port 3000), `npm run typecheck`, `npm run test` (`vitest`).
