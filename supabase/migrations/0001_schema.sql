-- AI Diagnostic LMS — schema, auth_role() helper, and RLS policies.
-- See docs/PLAN.md sections 3 and 3 (RLS table) for the design rationale.

-- ── Extensions ────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ── Types ─────────────────────────────────────────────────────────────────
create type user_role as enum ('student', 'teacher', 'admin');

-- ── Tables ────────────────────────────────────────────────────────────────
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
  options        jsonb not null,
  correct_option int  not null,
  reasons        jsonb not null,
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

create index questions_set_id_idx on questions(set_id);
create index attempts_student_id_idx on attempts(student_id);
create index attempts_set_id_idx on attempts(set_id);
create index responses_question_id_idx on responses(question_id);

-- ── auth_role() ───────────────────────────────────────────────────────────
-- security definer avoids the recursive-policy trap of a profiles policy
-- that queries profiles to decide who may query profiles.
create function auth_role() returns user_role
  language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

-- ── Row Level Security ────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table question_sets enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;
alter table responses enable row level security;

-- profiles: own row (student/teacher), select all (teacher/admin), all (admin)
create policy profiles_select_own on profiles
  for select using (id = auth.uid());

create policy profiles_select_all_staff on profiles
  for select using (auth_role() in ('teacher', 'admin'));

create policy profiles_update_own on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy profiles_admin_all on profiles
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- question_sets: published sets are readable by students/teachers; admin has full access
create policy question_sets_select_published on question_sets
  for select using (published or auth_role() in ('teacher', 'admin'));

create policy question_sets_admin_all on question_sets
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- questions: readable when the parent set is published (or by staff), never leaking
-- correct_option/correct_reason before submit is enforced in application code by
-- selecting an explicit column list — RLS controls row visibility, not column visibility.
create policy questions_select_published on questions
  for select using (
    auth_role() in ('teacher', 'admin')
    or exists (
      select 1 from question_sets qs
      where qs.id = questions.set_id and qs.published
    )
  );

create policy questions_admin_all on questions
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- attempts: a student owns their own attempts; teachers/admins can see all
create policy attempts_select_own on attempts
  for select using (student_id = auth.uid() or auth_role() in ('teacher', 'admin'));

create policy attempts_insert_own on attempts
  for insert with check (student_id = auth.uid());

create policy attempts_update_own on attempts
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy attempts_admin_all on attempts
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');

-- responses: a student owns responses on their own attempts; teachers/admins can see all
create policy responses_select_own on responses
  for select using (
    auth_role() in ('teacher', 'admin')
    or exists (
      select 1 from attempts a
      where a.id = responses.attempt_id and a.student_id = auth.uid()
    )
  );

create policy responses_insert_own on responses
  for insert with check (
    exists (
      select 1 from attempts a
      where a.id = responses.attempt_id and a.student_id = auth.uid()
    )
  );

create policy responses_update_own on responses
  for update using (
    exists (
      select 1 from attempts a
      where a.id = responses.attempt_id and a.student_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from attempts a
      where a.id = responses.attempt_id and a.student_id = auth.uid()
    )
  );

create policy responses_admin_all on responses
  for all using (auth_role() = 'admin') with check (auth_role() = 'admin');
