# LMS Diagnostik — agent handoff

Client project. A learning system built around a **three-tier diagnostic test**. The admin types only
an *indicator* (a learning objective); AI generates the questions, 4 answer options and 4 reason
options. For each question the student picks (1) an answer, (2) a reason, (3) **yakin / tidak yakin**
(sure / not sure). Teachers see per-student diagnosis (e.g. misconception). Any subject, not just one.
Roles and pages: student (dashboard, quiz, history, profile) · teacher (dashboard, student detail with
diagnosis, profile) · admin (generate set, set history/edit, user management) · login.

State as of 2026-10-29.

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
   - Displays student or teacher name, grade/role badge, and email at top. Supports customizable `profileHref` (e.g. `/profile` or `/teacher/profile`).
   - Menu items: `PROFIL & KEAMANAN ➔` and direct `KELUAR DARI AKUN ➔` (calls `signOut`).
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
12. **Teacher Dashboard — Inspired by Student Dashboard (`components/TeacherDashboardView.tsx` & `app/teacher/dashboard/page.tsx`)**:
   - Mobile-first single-column ergonomics (`maxWidth: 440px`), mirroring the student dashboard layout and aesthetics.
   - Pinned sticky navbar with brand mark `[ LMS DIAGNOSTIK ] [GURU]`, theme toggle, and profile avatar initials.
   - Hero greeting card ("Selamat pagi/siang/sore/malam, Bu Sari Wulandari, M.Pd.") + role badge.
   - 3-box diagnostic stats row: Total Paket Soal, Rata-Rata Skor Kelas (highlighted with Ferrari Red shadow), and Tingkat Partisipasi Siswa.
   - Search input (`.boxy-input`) for test packs & indicators + subject filter pills (`[ SEMUA ]`, `[ FISIKA ]`, `[ BIOLOGI ]`, etc.).
   - Test pack cards with subject dot badges, question counts, learning indicator snippets, student participation counter (`4 / 28 Mengerjakan`), misconception warning tags (`⚠ 3 Siswa Miskonsepsi`), and direct CTA link `LIHAT HASIL & SISWA ➔` to `/teacher/sets/[id]`.
13. **Teacher Test Pack Detail & Diagnostic Matrix (`components/TeacherPackDetailView.tsx` & `app/teacher/sets/[id]/page.tsx`)**:
   - Dedicated mobile-first detail view accessed by clicking a test pack card.
   - Sticky header with `[ ❮ BERANDA GURU ]` back button, active subject badge, and theme toggler.
   - Test pack overview banner with full indicator box and multi-segment class diagnostic distribution bar (Paham, Miskonsepsi, Lucky Guess, Tidak Paham).
   - Real-time student search input + quick filter pills: `[ SEMUA ]`, `[ ⚠ MISKONSEPSI ]`, `[ ✓ PAHAM ]`, `[ ✗ TIDAK PAHAM ]`, `[ ✦ LUCKY ]`.
   - Student cards with avatar initials, student name, grade, score badge (`SKOR: 67 / 100`), misconception alert badge, and a horizontal question matrix strip of numbered square chips (`01`..`06`) color-coded by diagnosis.
   - Interactive accordion trigger (`[ LIHAT JAWABAN 3-TIER ▾ ]`): reveals the complete question-by-question breakdown with Tier 1 answer, Tier 2 reason, Tier 3 confidence, diagnosis badge, and pedagogical misconception warnings.
   - Shared data module [`lib/teacher-data.ts`](file:///d:/proj/LMS/lib/teacher-data.ts) supporting live Supabase queries and standalone mock fallback.
14. **Teacher Profile View (`components/TeacherProfileView.tsx` & `app/teacher/profile/page.tsx`)**:
   - Neo-brutalist profile view tailored for teachers with sticky header, back button (`[ ❮ KEMBALI KE BERANDA ]`), theme toggler, identity card (`[ SW ] Bu Sari Wulandari, M.Pd.`), change password form, and sign-out button.
15. **Unified Admin Command Center Hub (`components/AdminDashboardView.tsx` & `app/admin/dashboard/page.tsx`)**:
   - Single-screen responsive neo-brutalist command center (`maxWidth: 760px`) matching Ferrari Red / Rosso Corsa aesthetic.
   - Pinned sticky navbar with brand mark `[ LMS DIAGNOSTIK ] [ADMIN]`, theme toggle, and profile avatar initials `[ AK ]` (`Pak Andi Kurniawan`).
   - Hero greeting card + 3-box tactical stats row: `04 PAKET SOAL` (18 Butir Soal), `02 DITERBITKAN` (highlighted with Ferrari Red shadow), and `32 PENGGUNA` (28 Siswa · 3 Guru · 1 Admin).
   - Interactive segmented tab bar:
     - `✦ BUAT SOAL (AI)`: AI Question Generator with indicator textarea, subject, grade, difficulty, question count inputs, animated loading state with Gemini 1.5 Flash branding, instant 3-tier question preview with green key badges for answers and reasons, and CTAs to save as draft or publish directly.
     - `🗂 PAKET SOAL (4)`: Question sets / test cases directory with real-time search, status filter pills (`[ SEMUA ]`, `[ DITERBITKAN ]`, `[ DRAF ]`), quick question preview toggle (`INTIP SOAL ▾`), publish status toggle button, and direct link to question editor (`/admin/sets/[id]`).
     - `👥 PENGGUNA (32)`: User directory with search, role filter pills (`[ SEMUA ]`, `[ SISWA ]`, `[ GURU ]`, `[ ADMIN ]`), expandable add user form with grade/role fields, user list with boxy initials avatars, and interactive reset password action with visual confirmation.
16. **Admin Test Pack Question Editor (`components/QuestionEditor.tsx` & `app/admin/sets/[id]/page.tsx`)**:
   - Neo-brutalist detail and editing view for test cases/questions with sticky header, back button `[ ❮ KEMBALI KE ADMIN HUB ]`, theme toggle, set overview card, and publish toggle button.
   - Per-question editor card with question stem textarea, radio selectors and letter badges (A, B, C, D) for Tier 1 answer keys, radio selectors for Tier 2 reason keys, and instant save button.
   - Supports standalone mock preview fallback (`fetchAdminSetDetail` in `lib/admin-data.ts`) and live Supabase persistence.
17. **Admin Profile View (`components/AdminProfileView.tsx` & `app/admin/profile/page.tsx`)**:
   - Administrator profile screen with tactile boxy avatar (`[ AK ]` with Ferrari Red background), identity card, change password form, and session sign-out button.
18. **Mobile-First Neo-Brutalist Login Screen (`components/LoginView.tsx` & `app/(auth)/login/page.tsx`)**:
   - Mobile-first neo-brutalist authentication screen (`maxWidth: 420px`) with Ferrari Red / Rosso Corsa aesthetic.
   - 3-tier visual mark (3 horizontal bars in Ferrari Red, soft slate, and border) representing the three diagnostic tiers (Jawaban, Alasan, Keyakinan).
   - Tactile login card with `.boxy-input` for email and password, show/hide password toggle, and Ferrari Red submit CTA button (`[ MASUK KE SISTEM ➔ ]`).
   - 1-click Quick Demo Account pills: `[ 🎓 SISWA ]` (Rani Putri), `[ 👩‍🏫 GURU ]` (Bu Sari), and `[ ⚙ ADMIN ]` (Pak Andi) for instant evaluator/demo role testing.
   - Dual-mode operation: connects to live Supabase Auth when credentials exist, or performs automatic mock redirection to the appropriate dashboard (`/dashboard`, `/teacher/dashboard`, `/admin/dashboard`) in standalone preview mode.

19. **Right-to-Left Fading Dither Texture on Cards (.dither-fade-right)**:
   - High-contrast 2x2 halftone checkerboard pattern (--dither-svg) positioned on the right edge (width: 65%) of test pack cards.
   - Smooth CSS gradient mask (mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)) providing an authentic HYDE-style fade from right to left without obstructing card typography or interactive buttons (pointer-events: none).
   - Integrated across: Student Dashboard (in-progress card and available test set cards), Teacher Dashboard (test pack cards), Teacher Pack Detail (overview hero card), Admin Dashboard (test pack cards), and Admin Set Detail (header card).

20. **100% Pure Mock AI Question Generator for UI/UX Review**:
   - Switched AI Question Generator (`AdminDashboardView.tsx` & `actions.ts`) to 100% client/mock simulation.
   - Removed external Google Gemini API calls, eliminating 503 high-demand spike errors and API quota dependencies during review.
   - Dynamic 3-tier question generation based on input topic, indicator, subject, and question count over a snappy 1.2s tactile progress sequence (`[ MEMPROSES... ]`).

21. **Direction-Aware Segment Deck Slide in Admin Dashboard (`components/AdminDashboardView.tsx`)**:
   - Replicated quiz question slide transition physics for the 3 main admin command center segments (`BUAT SOAL`, `PAKET SOAL`, `PENGGUNA`).
   - Tracks tab indices (0, 1, 2) to dynamically switch between `.slide-forward` (`slideInFromRight` 0.26s cubic-bezier) and `.slide-backward` (`slideInFromLeft` 0.26s cubic-bezier).
   - Cleaned AI question button state to only show snappy animated `[ MEMPROSES... ]` during mock generation.

22. **Viewport Pinned Toast Notification (`components/AdminDashboardView.tsx` & `app/globals.css`)**:
   - Pinned success notifications directly to the physical viewport bottom via React Portal (`createPortal(..., document.body)`), completely breaking out of transformed ancestor containers (`PageTransition`, deck sliders).
   - Centered horizontally (`bottom: 28px; left: 50%; transform: translate(-50%, 0)`), responsive (`maxWidth: 460px; width: calc(100% - 32px)`), with springy `@keyframes toastSlideUp` animation, high-contrast boxy shadow, and `[ SUKSES ]` accent badge.

## Remaining Next Steps
- Integrate UI with backend Server Actions from `fullstack` branch when ready for live Supabase testing.
- Scripts: `npm run dev` (runs Turbopack on port 3000), `npm run typecheck`, `npm run test` (`vitest`).
