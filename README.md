# LMS Diagnostik

Three-tier diagnostic testing platform. An admin supplies a learning
*indicator*; AI generates questions, answer options, and reason options.
Students answer in three tiers (answer → reason → confidence). Teachers read
the resulting misconception diagnosis.

Full design rationale, schema, and RLS policy table: [`docs/PLAN.md`](docs/PLAN.md).

## Stack

- Next.js (App Router) + TypeScript
- Supabase (Postgres + Auth + RLS)
- Gemini Flash via its OpenAI-compatible endpoint
- Vercel

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
npm run lint
npm run test       # vitest — diagnose.test.ts
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

- Every colour lives in `app/theme.css` as a CSS custom property — swap that
  one file when the client delivers a real palette, never hardcode a colour
  elsewhere.
- The diagnosis rubric is `lib/diagnose.ts`, a pure function with an
  eight-assert test. It is never stored — every page computes it at read
  time from the raw `responses` rows, so changing the rubric touches only
  that one file.
- `lib/database.types.ts` is hand-written to match the migration. Regenerate
  it with `supabase gen types typescript` once a live project exists, and
  keep it in sync with the migration file until then.
