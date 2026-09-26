# LMS Diagnostik — agent handoff

Client project. A learning system built around a **three-tier diagnostic test**. The admin types only
an *indicator* (a learning objective); AI generates the questions, 4 answer options and 4 reason
options. For each question the student picks (1) an answer, (2) a reason, (3) **yakin / tidak yakin**
(sure / not sure). Teachers see per-student diagnosis (e.g. misconception). Any subject, not just one.
Roles and pages: student (dashboard, quiz, history, profile) · teacher (dashboard, student detail with
diagnosis, profile) · admin (generate set, set history/edit, user management) · login.

State as of 2026-09-26, carried over from Claude Code sessions.

## ⚠ Where the code is
- **The app was built by a Claude cloud session** (Phases 1–5 plus a README) and pulled into this folder on
  2026-09-27. Run `npm install` before first use.
- Unmerged work on two branches (2026-09-25/26):
  - `origin/claude/adoring-brown-4qkg0d`, **5 fixes**:
    - fix `auth.users` NULL text columns causing login 500s
    - retry AI generation on 429/503
    - log the retry attempts
    - keep form fields after a failed generation
    - shuffle AI answer positions and fix low-contrast option inputs
  - `origin/main-0oo446`, 1 commit: replace the raw-SQL seed with an Admin-API seed script.
- First step: review and merge both branches (ask the user first).
- `docs/ui-reference/*.dc.html` are the approved UI mockups exported from a Claude
  design canvas: login, student dashboard, quiz, teacher detail, admin generate. They reference a
  runtime (`support.js`) that isn't included, so they **don't render in a browser**. Read them as a
  design spec: exact colours, fonts, spacing, copy, and the quiz interaction logic.

## Locked decisions (from `docs/PLAN.md`; don't change silently)
- Next.js App Router + TypeScript · **Supabase** (Postgres + Auth + RLS) · Vercel. Vercel Blob was
  dropped as unnecessary.
- AI: **Gemini Flash (free tier) via its OpenAI-compatible endpoint**, called with the `openai` SDK.
  `AI_BASE_URL` / `AI_MODEL` / `AI_API_KEY` come from env, so switching provider is config only. Fallbacks: Groq,
  then OpenRouter `:free`. Don't bet on Grok's free tier. Use JSON-schema structured output.
  Only admins trigger AI calls, so rate limits aren't a concern.
- AI output is always a **draft**: admin previews, edits, then publishes. Nothing auto-publishes.
- **Diagnosis is computed on read, never stored.** `lib/diagnose.ts` is a pure function over
  (answer correct, reason correct, confident) with its test `lib/diagnose.test.ts`. When the client
  sends their real rubric, edit that function and all past attempts re-diagnose. If the rubric turns
  out to need AI-written narratives, that's a new phase, not an edit.
- All access control lives in RLS in one migration file (`supabase/migrations/0001_schema.sql`).
  Never `select *` questions in student-readable queries (answer keys would leak).
- Accounts are admin-provisioned: no signup and no self-service reset. The admin sets and resets passwords.
  Open question for the client: do students have real emails? If yes, switch to invite links.
- All colours live only in `app/theme.css`; the client's palette is still pending. Student-facing UI is in Indonesian.

## Design direction (UI reference)
Bricolage Grotesque (headings) + Plus Jakarta Sans (body). Brand gradient violet `#5B2BD9` →
magenta `#9B2BC9` → coral `#D12E63` on warm off-white `#FBF8F3`. Gradients are for brand moments only.
The four diagnosis colours carry meaning and must stay consistent everywhere: **Paham** green,
**Miskonsepsi** red (the loudest colour), **Lucky guess** amber, **Tidak paham** grey.
Quiz interaction: answer locks → reason → Yakin / Tidak yakin.

## What's left: Phase 6 (manual deploy)
Create the Supabase project, apply the migration, seed, set env vars (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`),
deploy on Vercel. See the remote README. Scripts: `npm run dev|typecheck|lint|test|build`.
Seed users use a placeholder password (see README). Change them after first login.
