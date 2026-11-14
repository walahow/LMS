# LMS Diagnostik

A modern learning management system built around a **three-tier diagnostic test** instrument. An administrator or teacher types only a learning *indicator* (learning objective); AI generates the test items, including 4 answer options and 4 reason options with detailed conceptual explanations.

Students complete the test sequentially across three tiers:
1. **Tier 1 (Jawaban)**: Student chooses an answer.
2. **Tier 2 (Alasan)**: Student commits to a reason justifying their answer.
3. **Tier 3 (Keyakinan)**: Student rates their confidence level (**Yakin / Tidak Yakin**).

Teachers and school administrators receive real-time, per-student and cohort-level diagnostic classifications:
- **Paham Konsep**: Correct answer, correct reason, confident.
- **Miskonsepsi**: Incorrect answer and/or incorrect reason, but confident.
- **Lucky Guess**: Correct answer and reason, but not confident (guessed).
- **Tidak Paham**: Incorrect answer and/or reason, and not confident.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack) + TypeScript
- **Styling**: Vanilla CSS Modules & CSS Custom Properties (zero heavy CSS runtime dependencies)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security + Supabase Auth)
- **AI Engine**: Google Gemini 1.5 Flash via OpenAI-compatible endpoint with exponential backoff retry
- **Unit Testing**: Vitest (30 unit tests across pure diagnostic logic, auth, actions, and mock datasets)
- **Deployment**: Vercel (Hobby tier) with Next.js 16 Edge proxy (`proxy.ts`)

---

## Design System: Mobile-First Neo-Brutalist (HYDE Aesthetic)

The user interface follows a high-contrast, tactile neo-brutalist aesthetic inspired by the **HYDE** design language:

- **Color Palette (Electric Royal Blue & Deep Midnight Oceanic)**:
  - Background: Soft cool paper `#F4F7FC` (light) / Deep midnight navy `#060D24` (dark).
  - Surface: Pure white `#FFFFFF` (light) / Midnight slate `#0C1736` (dark).
  - Accent: **Electric Royal Blue (`#116AF8`)** with `#0C56CC` hover (light) / **Cerulean Cyan (`#20BCED`)** (dark).
  - Borders: Crisp `1.5px`–`2px` solid oceanic ink (`#0B152B` light / `#8EA9CD` dark).
- **Tactile Shadows & Ambient Card Depth**:
  - Apple-style ambient cardstock drop shadow (`--shadow-ambient-card`) on `.boxy-card-flat` containers for tactile physical lift.
  - Hard offset interactive shadows: 3px (`--shadow-boxy-sm`) on active cards, 4px electric blue shadow (`--shadow-boxy-accent`) on selected options, and 6px shadow (`--shadow-boxy-lg`) on modals.
- **Halftone HYDE Dither Patterns**:
  - High-contrast 2x2 pixel checkerboard SVG dithers (`image-rendering: pixelated`, `mix-blend-mode: multiply`).
  - Right-to-left fading dither (`.dither-fade-right`) on test pack cards and right-to-left electric blue fading dither (`.dither-fade-right-accent`) on the login CTA button.
  - Strict Z-index elevation ensures all interactive buttons and badges sit cleanly above the dither background.
- **Mechanical Tactile Clicks**:
  - Snappy button push transitions (`transform 0.08s ease`, `box-shadow 0.08s ease`). On press (`:active`), buttons depress (`translate(2px, 2px)` with zero shadow).
- **Centered Neo-Brutalist Loader**:
  - Centered 52px geometric dual loader (`components/Spinner.tsx`) with spinning Electric Accent ring and counter-rotating tactile spark box `✦`.
- **Direction-Aware Slide Transitions**:
  - Dynamic forward (`slideInFromRight`) and backward (`slideInFromLeft`) slide transitions when navigating questions or switching admin command tabs.
- **MagicUI Theme Toggler**:
  - View Transitions API rectangular box reveal (`clip-path: inset(...)`) with 8-bit pixel sun/moon icons and 250ms duration. Scoped strictly to Dashboard and Profile views to eliminate distractions during test taking.
- **Score Swipe-Up Sheet**:
  - Fullscreen tactile overlay (`translateY(100%) -> 0`) featuring animated `NumberTicker` score count-up and 4-category diagnostic summary metrics.

---

## Role Features & Portals

### 1. Student Portal (`/dashboard`, `/quiz/[setId]`, `/history/[attemptId]`, `/profile`)
- **Dashboard (`/dashboard`)**:
  - Dynamic time-based greeting ("Selamat pagi/siang/sore/malam") with student initials and grade pill.
  - 3-box diagnostic stats row: Completed Sets, Average Score (accent shadow highlight), and Available Sets.
  - Active in-progress test card banner with progress tracking and direct resume CTA button.
  - Clean test cards displaying grade badge (`Kelas 10`), question count (`6 SOAL`), score badge, and dynamic action buttons (`MULAI TES ➔`, `LANJUTKAN ➔`, `ULAS ➔`, `COBA LAGI ↺`). Streamlined to remove redundant subject filter pills since all deployment tests are Physics.
- **Quiz Runner (`/quiz/[setId]`)**:
  - Mobile-first locked tier quiz flow: student cannot view reason options before committing to an answer, preventing reverse-reasoning and preserving misconception diagnostic signal.
  - Sticky top header with question counter and progress button modal (`[ 03 | 10 ▾ ]`).
  - **Completeness Enforcer**: Strictly prevents submitting incomplete answers. If any question lacks an answer, reason, or confidence, saving is blocked and a bottom toast notification appears with clickable chips (`[ SOAL 02 ➔ ]`) to jump directly to incomplete questions.
  - Post-test score calculation and automatic database persistence to `attempts` and `responses` tables via server actions with cache revalidation.
- **Review Mode & History (`/history/[attemptId]`, `/history`)**:
  - High-fidelity Neo-Brutalist review screen ([`StudentAttemptReviewView.tsx`](components/StudentAttemptReviewView.tsx)).
  - All selections are locked against modification.
  - Displays student's choice vs correct key for answers and reasons, confidence rating, diagnosis badge, and the **💡 PENJELASAN KONSEP & ALASAN BENAR** callout box.
- **Profile & Security (`/profile`)**:
  - Student identity card and tactile boxy avatar.
  - Password change form with unified [`BoxyPasswordInput.tsx`](components/BoxyPasswordInput.tsx) featuring animated diagonal SVG eye toggle and granular Indonesian validation feedback.

### 2. Teacher Portal (`/teacher/dashboard`, `/teacher/sets/[id]`, `/teacher/sets/[id]/students/[studentId]`, `/teacher/profile`)
- **Dashboard (`/teacher/dashboard`)**:
  - Metric boxes: Total Paket Soal, Rata-Rata Skor Kelas (accent shadow highlight), and Tingkat Partisipasi Siswa.
  - Real-time test pack search filtering by title and learning indicator.
  - Test pack cards showing question count, student participation count (`4 / 28 Mengerjakan`), misconception warning tags (`⚠ 3 Siswa Miskonsepsi`), and direct CTA `LIHAT HASIL & SISWA ➔`.
- **Test Pack Detail (`/teacher/sets/[id]`)**:
  - Test pack overview banner with full indicator and multi-segment class diagnostic distribution bar.
  - Real-time student search and quick filter pills: `[ SEMUA ]`, `[ ⚠ MISKONSEPSI ]`, `[ ✓ PAHAM ]`, `[ ✗ TIDAK PAHAM ]`, `[ ✦ LUCKY ]`.
  - Student cards displaying student avatar, name, grade, score badge, misconception count, and a horizontal question matrix strip of numbered chips (`01`..`06`) color-coded by diagnosis.
  - Each student card features a primary CTA button: **`[ DETAIL ➔ ]`**.
- **Dedicated Student Evaluation View (`/teacher/sets/[id]/students/[studentId]`)**:
  - Full-page inspection view ([`TeacherStudentDetailView.tsx`](components/TeacherStudentDetailView.tsx)) tailored specifically for teachers and labeled **DETAIL**.
  - Student identity header, score summary, and 4-box diagnostic distribution matrix.
  - Question-by-question breakdown showing student's choices, correct keys, confidence rating, teacher pedagogical diagnosis alert, and concept explanation.
  - Sticky top back button `[ ❮ KEMBALI ]` returns directly to the test pack view.
- **Profile (`/teacher/profile`)**:
  - Teacher identity card, password change form with show/hide password toggle, and session logout.

### 3. Administrator Command Center (`/admin/dashboard`, `/admin/sets/[id]`, `/admin/profile`)
- **Unified Command Center Hub (`/admin/dashboard`)**:
  - Direction-aware segmented tabs:
    - **`✦ BUAT SOAL (AI)`**: AI Question Generator with indicator textarea, subject, grade, difficulty, and question count inputs. Features animated Gemini Flash processing state, instant 3-tier question preview with green answer/reason key badges, and options to save as draft or publish.
    - **`🗂 PAKET SOAL`**: Directory with real-time search, status filter pills (`[ SEMUA ]`, `[ DITERBITKAN ]`, `[ DRAF ]`), publish toggle, and link to question editor (`/admin/sets/[id]`).
    - **`👥 PENGGUNA`**: User directory with role filter pills, user creation form, boxy initials avatars, and one-click password reset action.
- **Test Pack Question Editor (`/admin/sets/[id]`)**:
  - Detail editor for test items with question stem textarea, radio selectors with letter badges (A, B, C, D) for Tier 1 answer keys, radio selectors for Tier 2 reason keys, and instant save.
- **Admin Profile (`/admin/profile`)**:
  - Administrator profile with identity card, password change form, and session sign-out.

### 4. Authentication & Student Registration (`/login`, `/register`)
- **Dual Username / Email Login (`/login`)**:
  - Mobile-first neo-brutalist authentication screen with 3-tier visual mark.
  - Supports both **Username** and **Email** in the identifier field (`USERNAME / EMAIL`).
  - Automatic normalization: inputs without an `@` symbol automatically resolve to synthetic domain `@lms.local` (e.g. typing `hermione` resolves to `hermione@lms.local`).
  - Built-in role shortcuts: `guru` or `teacher` maps to `teacher@lms.local`; `admin` maps to `admin@lms.local`; `student` or `siswa` maps to `student@lms.local`.
  - **Multi-Device Concurrent Teacher Access**: Because authentication utilizes stateless JWT session cookies, multiple teachers or teaching staff can be logged into the teacher account on different laptops or mobile devices simultaneously without session conflicts or kicking each other out.
  - Interactive show/hide password toggle embedded inside input with animated diagonal stroke SVG eye icon (pupil permanently visible, line draws/retracts smoothly) and bullet placeholder masking (`••••••••`).
  - Accent submit button `[ LOG IN ➔ ]` with right-to-left fading blue dither (`.dither-fade-right-accent`).
  - Direct student onboarding callout card: `Belum punya akun siswa? [ DAFTAR SISWA ➔ ]` linking to `/register`.
- **Student Self-Registration (`/register`)**:
  - Dedicated public registration screen tailored for secondary school students who often lack dependable personal email inboxes.
  - **Username-First Form**: Student inputs `Nama Lengkap`, `Username` (3–20 alphanumeric chars), `Kelas / Rombel` (freeform string e.g. `Kelas X-A`, `10 MIPA 1`), and password confirmation with `BoxyPasswordInput`.
  - **Strict Role Lock**: Self-registration is strictly hardcoded to the `'student'` role on the server; external role injection is blocked. Teachers and administrators remain provisioned exclusively by administrators.
  - **Instant Activation & Login**: Automatically provisions the Supabase auth record and `profiles` entry, creates the session, and redirects immediately to `/dashboard`.
  - Standalone preview fallback: works offline without Supabase configured.

---

## Complete Route Inventory

| Route | Access / Role | Description |
|---|---|---|
| `/` | Public | Automatic redirect to `/login` |
| `/login` | Public | Neo-brutalist authentication screen with dual username/email support |
| `/register` | Public | Neo-brutalist student self-registration screen (strictly locked to student role) |
| `/dashboard` | Student | Student home: stats, resume card, test pack directory |
| `/quiz/[setId]` | Student | Live 3-tier sequential test runner with completeness check |
| `/history` | Student | Student test history directory |
| `/history/[attemptId]` | Student | Neo-brutalist post-quiz review mode with explanations |
| `/profile` | Student | Student profile and password change form |
| `/teacher/dashboard` | Teacher | Teacher home: class metrics, search, test pack cards |
| `/teacher/sets/[id]` | Teacher | Test pack detail: class diagnostic bar, student list, matrix chips |
| `/teacher/sets/[id]/students/[studentId]` | Teacher | Dedicated student 3-tier evaluation view (**DETAIL**) |
| `/teacher/students/[id]` | Teacher | Student detail fallback / direct attempt view |
| `/teacher/profile` | Teacher | Teacher profile and password security |
| `/admin/dashboard` | Admin | Unified hub: AI Question Generator, question sets, user directory |
| `/admin/sets/[id]` | Admin | Test pack question editor with key selectors |
| `/admin/profile` | Admin | Administrator profile and security |

---

## Local Development & Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 25)
- npm or pnpm
- Supabase account (free tier) or local Supabase CLI
- Google AI Studio API key (free tier)

### 2. Installation
```bash
git clone https://github.com/walahow/LMS.git
cd LMS
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only (for seeding and admin user management)
AI_API_KEY=your-gemini-api-key                  # From Google AI Studio
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
AI_MODEL=gemini-1.5-flash
```

> [!NOTE]
> The app includes a safe bypass guard in `proxy.ts`. If `NEXT_PUBLIC_SUPABASE_URL` is unset, the frontend runs seamlessly in standalone preview mode with realistic mock data.

### 4. Database Migration & Automated Seeding
Apply migrations against your Supabase project in order:
1. `supabase/migrations/0001_schema.sql` (initial schema, enums, tables, and RLS policies)
2. `supabase/migrations/0002_question_explanation.sql` (adds `explanation` column to `questions`)
3. `supabase/migrations/0003_teacher_published_only.sql` (teacher visibility policies for published sets)
4. `supabase/migrations/0004_profile_grade_username.sql` (adds `grade` and `username` columns to `profiles`)

Run the automated seeder script:
```bash
node scripts/seed.mjs
```

This provisions three Hogwarts test accounts with password `password123`:
| Role | Name | Identifier (Username / Email) | Password | Notes |
|---|---|---|---|---|
| Admin | Albus Dumbledore | `admin` or `admin@lms.local` | `password123` | Full supervisory & management access |
| Teacher | Severus Snape | `guru`, `teacher`, or `teacher@lms.local` | `password123` | Shared across teaching staff (multi-device) |
| Student | Hermione Granger | `student` or `student@lms.local` | `password123` | Students can also self-register at `/register` |

It also provisions an active 6-question 3-tier Physics test pack:
- **Title**: *Hukum Newton tentang Gerak dan Gaya* (`5e4aa618-e064-45ef-8cda-2fb58e8d6c93`)
- Includes 4 answer choices, 4 reason choices, confidence rating, and full pedagogical explanations per question.

### 5. Running the App & Verification
```bash
# Start Turbopack development server (http://localhost:3000)
npm run dev

# Run TypeScript type check (0 errors)
npm run typecheck

# Run Vitest test suite (42 passed tests)
npm run test

# Production build check
npm run build
```

---

## Testing & Quality Assurance

The test suite covers pure business logic, database actions, AI resilience, authentication, student self-registration, and dataset consistency:

- `app/(auth)/register/actions.test.ts`: Student registration validation (full name, username formatting, grade string, password confirmation, and strict role lock).
- `lib/diagnose.test.ts`: Pure diagnostic classification matrix tests (8 tests asserting Paham Konsep, Miskonsepsi, Lucky Guess, and Tidak Paham permutations).
- `app/(student)/quiz/[setId]/actions.test.ts`: Server action validation for attempt creation, response insertion, and cache invalidation.
- `lib/ai.test.ts`: Structured output schema validation and answer/reason shuffling verification.
- `lib/auth-demo.test.ts`: Password change validation edge cases (empty, length < 8, mismatch, session expiry, rate limiting, weak passwords).
- `lib/data-consistency.test.ts`: 100% mathematical reconciliation of cohort diagnostics, score calculations, admin stats, and concept explanations.

---

## Production Deployment to Vercel

1. **Push to GitHub**: Push the `main` branch to your repository.
2. **Import to Vercel**: Import the project in Vercel dashboard.
3. **Set Environment Variables**: In Vercel Project Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY`
   - `AI_BASE_URL`
   - `AI_MODEL`
4. **Deploy**: Trigger deployment. Vercel will build and deploy automatically from `main`.
5. **Post-Deploy Smoke Test**:
   - Log in as `admin@lms.local` → verify `/admin/dashboard` AI generation and user management.
   - Log in as `teacher@lms.local` → verify `/teacher/dashboard`, inspect student matrix, click `[ DETAIL ➔ ]` to view student 3-tier evaluation.
   - Log in as `student@lms.local` → complete test on `/quiz/[setId]` → check score sheet and review explanations.
