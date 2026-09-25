# AI Diagnostic LMS — Design & Implementation Plan

Three-tier diagnostic testing platform. Admin supplies a learning *indicator*;
AI generates questions, answer options, and reason options. Students answer in
three tiers (answer → reason → confidence). Teachers read the resulting
misconception diagnosis.

---

## 1. Locked decisions

| Area | Decision |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Database / Auth / Storage | Supabase (Postgres + Auth + RLS) |
| AI | Gemini Flash free tier via OpenAI-compatible endpoint |
| Hosting | Vercel |
| Accounts | Admin provisions all users. Self-signup deferred. |
| Classes | None. Flat cohort; every teacher sees every student. |
| AI input | Indicator + subject/grade/count/difficulty. No file upload. |
| Quiz flow | Sequential, locked tiers |
| Vercel Blob | **Dropped.** No files to store; Supabase covers it if that changes. |

---

## 2. Two decisions that carry the design

**The diagnosis is computed, never stored.** `responses` holds only the three
raw choices. A pure function derives the diagnosis at read time. The client's
real rubric arrives later — when it does, we edit one function and every
historical attempt reclassifies itself. Storing a diagnosis column would weld
us to a rubric nobody has seen yet, and every rubric revision would become a
data migration.

**Access control lives in RLS, not in route handlers.** Policies are written
once against the tables. A forgotten check in a Server Action cannot leak
another student's answers, because Postgres refuses the row. This is also what
makes the deferred class-code feature cheap: add `class_id`, tighten two
policies, change no application code.

---

## 3. Data model

```sql
create type user_role as enum ('student','teacher','admin');

create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  role       user_role not null default 'student',
  full_name  text not null,
  created_at timestamptz not null default now()
);

create table question_sets (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  indicator  text not null,
  subject    text,
  grade      text,
  published  boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table questions (
  id             uuid primary key default gen_random_uuid(),
  set_id         uuid not null references question_sets(id) on delete cascade,
  position       int  not null,
  stem           text not null,
  options        jsonb not null,   -- string[]
  correct_option int  not null,
  reasons        jsonb not null,   -- string[]
  correct_reason int  not null,
  unique (set_id, position)
);

create table attempts (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references profiles(id) on delete cascade,
  set_id       uuid not null references question_sets(id) on delete cascade,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);

create table responses (
  attempt_id  uuid not null references attempts(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  answer      int  not null,
  reason      int  not null,
  confident   boolean not null,
  primary key (attempt_id, question_id)
);
```

`options` and `reasons` stay as `jsonb` arrays rather than child tables — they
are always read and written whole, alongside their question. A child table
would buy nothing but joins.

Retakes are free: a student simply gets a new row in `attempts`. History lists
attempts, newest first.

### RLS

A `security definer` helper avoids the recursive-policy trap on `profiles`:

```sql
create function auth_role() returns user_role
  language sql stable security definer set search_path = public as $BODY$
  select role from profiles where id = auth.uid()
$BODY$;
```

| Table | Student | Teacher | Admin |
|---|---|---|---|
| `profiles` | own row | select all | select all |
| `question_sets` | select where `published` | select where `published` | all |
| `questions` | select where parent published | same | all |
| `attempts` | own (select/insert/update) | select all | select all |
| `responses` | own via `attempt_id` | select all | select all |

Students must not be able to read `correct_option` / `correct_reason` before
submitting. Enforced by selecting an explicit column list in the quiz query —
never `select *`.

---

## 4. Diagnosis

The full three-tier classification table, in four lines:

```ts
export type Diagnosis = 'paham' | 'lucky_guess' | 'miskonsepsi' | 'tidak_paham';

export function diagnose(
  r: { answer: number; reason: number; confident: boolean },
  q: { correct_option: number; correct_reason: number },
): Diagnosis {
  const okAnswer = r.answer === q.correct_option;
  const okReason = r.reason === q.correct_reason;
  if (!r.confident) return okAnswer && okReason ? 'lucky_guess' : 'tidak_paham';
  return okAnswer && okReason ? 'paham' : 'miskonsepsi';
}
```

| Answer | Reason | Confidence | Diagnosis |
|---|---|---|---|
| ✓ | ✓ | Yakin | Paham konsep |
| ✓ | ✓ | Tidak yakin | Lucky guess |
| ✓ | ✗ | Yakin | **Miskonsepsi** |
| ✗ | ✓ | Yakin | **Miskonsepsi** |
| ✗ | ✗ | Yakin | **Miskonsepsi** |
| any | any | Tidak yakin | Tidak paham konsep |

Ships with `diagnose.test.ts` — eight asserts, one per row. This is the only
logic in the system whose silent breakage would be invisible in the UI while
corrupting every teacher report, so it gets the one test.

---

## 5. AI layer

Single file, `lib/ai.ts`, single export:

```ts
generateSet({ indicator, subject, grade, count, difficulty }): Promise<Question[]>
```

Provider is configuration, not code. All three candidate providers speak the
OpenAI wire format:

```
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
AI_MODEL=<current Flash id — confirm in AI Studio, ids rotate>
AI_API_KEY=...
```

Swapping to Groq or OpenRouter is an env change.

**Why Gemini:** ~1,500 requests/day free with no credit card, and `json_schema`
structured output that guarantees the returned shape. That removes the entire
parse-retry-repair layer a free-text model would require. Groq is the fallback
(30 RPM, no card); OpenRouter is third (50 req/day until a one-time $10 spend,
and its free model roster churns). xAI Grok is not a 2–4 month bet — its free
access is promotional.

Rate limits are a non-issue regardless: the AI runs only when an admin builds a
set. Students and teachers never trigger a call.

**Nothing auto-publishes.** Generate → preview → edit → publish. The AI will
occasionally misread an indicator, and the admin edit screen is already a
required page.

---

## 6. Routes

```
/(auth)/login
/(student)/dashboard             pick a set
/(student)/quiz/[setId]          three-tier flow
/(student)/history               past attempts
/(student)/history/[attemptId]   per-question review
/(student)/profile
/(teacher)/dashboard             student list + headline diagnosis counts
/(teacher)/students/[id]         per-attempt, per-question breakdown
/(teacher)/profile
/(admin)/dashboard               generate a new set
/(admin)/sets                    list existing sets
/(admin)/sets/[id]               edit / publish / unpublish
```

Mutations are Server Actions. No separate API routes — the only HTTP client is
this app.

Role routing via middleware on the three route groups, reading the role from
the session.

### Login

The only unauthenticated page in the app. Email + password against Supabase
Auth — **no signup link and no registration form**, because admin provisions
every account. A visitor with no account has nothing to do here.

- `/` redirects: no session → `/login`; session → the dashboard for that role.
- `/login` with an existing session redirects to that dashboard rather than
  showing the form again.
- After sign-in, read the role from `profiles` and redirect: student →
  `/dashboard`, teacher → `/teacher/dashboard`, admin → `/admin/dashboard`.
- Failed sign-in shows one generic message. Never distinguish "no such user"
  from "wrong password" — that difference tells an attacker which emails are
  real.
- Rate-limit is Supabase's default; no custom throttling.

**First login and password reset.** Admin sets an initial password when
creating the account and hands it over; the student changes it from the profile
page. This assumes students may not have reliable email addresses, which is the
safe assumption for a school cohort — a Supabase email-invite flow (user sets
their own password from a link) is strictly nicer but dies if the students
have no inbox. Self-service "forgot password" needs email too, so until that is
confirmed, password reset is an admin action on the provisioning screen.

*If the client confirms every student has a working email, switch to
`inviteUserByEmail` and add the reset flow — a Phase 1 change, roughly one
screen either way.*

### Quiz interaction

One question per screen. Answer options render first. On selection they lock
and reason options appear; on selecting a reason it locks and the
yakin/tidak-yakin control appears. Confirming writes the `responses` row and
advances.

Locking is the point: a student who sees the reason options before committing
to an answer can reason backwards to the answer, which destroys the
misconception signal the whole instrument exists to capture.

---

## 7. Theming

Client palette is pending. Every colour is a CSS custom property in one file
(`app/theme.css`); gradients are defined in terms of those properties.
Placeholder palette now, one-file swap when the client delivers. No component
hardcodes a colour.

---

## 8. Phases

**Phase 1 — Foundation**
Next.js scaffold, Supabase project, schema migration, RLS policies, `auth_role()`,
login page (§6), `/` and role-based redirects, middleware guarding the three
route groups, admin user-provisioning screen with initial-password + reset
(service-role key, server-side only), password change on the profile page.
*Done when:* each of three seeded roles logs in and lands on its own dashboard,
and a student's direct request for another student's `attempts` row returns empty.

**Phase 2 — Generation**
`lib/ai.ts` with structured output. Admin dashboard generate form. Preview →
edit → publish. `/admin/sets` list and edit page.
*Done when:* an indicator produces a saved, editable, publishable set.

**Phase 3 — Student flow**
Dashboard set picker, sequential locked quiz, attempt/response persistence,
resume on refresh.
*Done when:* a student completes a set and the raw choices are in the database.

**Phase 4 — Diagnosis & reporting**
`diagnose()` + its test. Teacher dashboard, student detail page, student history
and per-attempt review.
*Done when:* a teacher opens a student and sees per-question diagnoses matching
the table in §4.

**Phase 5 — Theme**
Apply the client palette, gradients, responsive pass, loading and empty states.

**Phase 6 — Deploy**
Vercel, env vars, seed an admin, smoke test all three roles in production.

---

## 9. Awaiting the client

- **Colour palette** — blocks phase 5 only.
- **Rubric** — assumed to be the standard three-tier table in §4. If it differs,
  it is a change to one function; if they want an AI-written narrative per
  student, that is a new subsystem and a new phase.
- **Do students have working email addresses?** If yes, switch login to
  Supabase email invites and enable self-service password reset. If no, admin
  sets and resets passwords (the assumption currently built in). See §6.
- Indonesian is assumed throughout the student-facing UI.

## 10. Environment

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY   # server-only, user provisioning
AI_API_KEY
AI_BASE_URL
AI_MODEL
```
