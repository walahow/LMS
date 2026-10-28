# LMS Diagnostik

Three-tier diagnostic testing platform. An admin supplies a learning
*indicator*; AI generates questions, answer options, and reason options.
Students answer in three tiers (answer → reason → confidence). Teachers read
the resulting misconception diagnosis.

Full design rationale, schema, and RLS policy table: [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Auth + RLS)
- Gemini Flash via Google AI Studio
- Vercel

## UI & Design Direction (Neo-Brutalist / HYDE Direction)

- **Palette**: Ferrari Red (Rosso Corsa `#FF2800`), Soft Paper / Warm Platinum (`#F8F8FA` / `#E8E8ED`), Deep Slate (`#121215` / `#1A1A1F`), Crisp `1.5px`–`2px` borders.
- **Tactile Shadows & Dither**: Selective overshadow (3px on active card, 4px Ferrari red shadow on selected options). 2x2 SVG halftone checkerboard dither pattern overlays on active selections and right-to-left fading dither (`.dither-fade-right`) on test pack cards across all roles.
- **Sticky Navbar**: Full-width pinned header (`position: sticky; top: 0; width: 100%`) enabled by `overflow-x: clip` on `html, body`.
- **Direction-Aware Deck Slide**: Dynamic slide transitions (`slide-forward` from right, `slide-backward` from left) when stepping through questions.
- **Two-Stage Tier Unlock**: Outer container expands first (`0.36s`), followed by inner content reveal (`0.28s`).
- **MagicUI Theme Toggler**: Rectangular box reveal (`clip-path: inset(...)`) with 8-bit pixel sun/moon icons and snappy 250ms transition.
- **Score Swipe Overlay**: Fullscreen swipe-up sheet (`translateY(100%) -> 0`) with animated `NumberTicker` score and four diagnostic category counts, plus smooth exit animation.
- **Streamlined Quiz Interface**: Minimalist, distraction-free cards focusing on learning content (single question counter `SOAL 01`, clean section titles without tier badges or redundant selection labels).
- **Mobile-First Role Dashboards**:
  - **Student** (`/dashboard`, `/profile`): time-based greeting, diagnostic metrics, active test resume banner, subject filter pills, card score feedback.
  - **Teacher** (`/teacher/dashboard`, `/teacher/sets/[id]`, `/teacher/profile`): test pack directory, class diagnostic distribution bar, per-student matrix strip chips (`01`..`06`) color-coded by diagnosis, 3-tier expandable answer details.
  - **Admin** (`/admin/dashboard`, `/admin/sets/[id]`, `/admin/profile`): unified command center with 3 segmented tabs (`✦ BUAT SOAL (AI)`, `🗂 PAKET SOAL`, `👥 PENGGUNA`), metric cards matching student/teacher layouts, AI question generator with Gemini Flash branding, question editor with answer/reason key toggles, user management with password resets.
  - **Authentication** (`/login`): mobile-first neo-brutalist login screen with 3-tier visual mark, `.boxy-input`, 1-click Quick Demo Account pills (`🎓 SISWA`, `👩‍🏫 GURU`, `⚙ ADMIN`), dual-mode Supabase/offline mock support.
- **Tactile Route Transitions**: 0.22s Apple/Framer deceleration vertical lift + fade-in with automatic cleanup preserving CSS sticky headers.

## Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Var | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (keep secret — used only for admin user provisioning) |
| `AI_API_KEY` | Google AI Studio → API keys |
| `AI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` (default in `.env.example`) |
| `AI_MODEL` | Current Gemini Flash model id from AI Studio — ids rotate, confirm there |

Run the app:

```bash
npm run dev       # http://localhost:3000
npm run typecheck
npm run test       # vitest — diagnose.test.ts, data-consistency.test.ts
npm run build
```

## Database: migration and seed

Apply `supabase/migrations/0001_schema.sql` against your project. Either:

- **Supabase CLI**: `supabase db push` (with the CLI linked to your project), or
- **SQL Editor**: paste the file's contents into the Supabase dashboard's SQL
  Editor and run it. This is also how to run `supabase/seed.sql` — it writes
  directly into `auth.users`/`auth.identities`, which requires the
  dashboard's elevated `postgres` role rather than the anon/service-role API.

The seed creates one admin, one teacher, and one student, all with the
placeholder password `password123`:

| Role | Email |
|---|---|
| admin | admin@lms.local |
| teacher | teacher@lms.local |
| student | student@lms.local |

Sign in once as each and change the password from the profile page, or reset
them from `/admin/users` once an admin is logged in.

## Manual Phase 6 — deploy

The five build phases (foundation, AI generation, student flow, diagnosis
and reporting, theme) are done. What's left needs a real Supabase project,
a real Gemini key, and a Vercel account — none of which exist in this
session — so it's on you:

1. **Create a Supabase project** at supabase.com. Note its URL and anon key
   (Settings → API).
2. **Run the migration and seed** against it, per the section above.
3. **Get a Gemini API key** from Google AI Studio (aistudio.google.com →
   Get API key). Confirm the current Flash model id there — ids rotate.
4. **Deploy to Vercel**: import this repo, set the six env vars from
   `.env.example` in the project settings, deploy.
5. **Smoke test all three roles** against the deployed URL:
   - Sign in as `admin@lms.local` → land on `/admin/dashboard` → create a
     question set from an indicator → review/edit the generated questions →
     publish it → create a real user via `/admin/users`.
   - Sign in as `teacher@lms.local` → confirm the new student appears on
     `/teacher/dashboard` with zero diagnosis counts.
   - Sign in as `student@lms.local` → confirm the published set appears on
     `/dashboard` → complete it → confirm `/history` shows the attempt with
     a diagnosis per question, and that the teacher's dashboard counts
     updated.
6. Once confirmed, change or remove the seeded placeholder passwords.

## Notes for future changes

- Every colour lives in `app/theme.css` / `app/globals.css` as CSS custom properties — swap that
  file when the client delivers a real palette, never hardcode a colour
  elsewhere.
- The diagnosis rubric is `lib/diagnose.ts`, a pure function with an
  eight-assert test. It is never stored — every page computes it at read
  time from the raw `responses` rows, so changing the rubric touches only
  that one file.
- `lib/database.types.ts` is hand-written to match the migration. Regenerate
  it with `supabase gen types typescript` once a live project exists, and
  keep it in sync with the migration file until then.
