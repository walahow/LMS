-- Restrict teachers to only viewing published question sets and their questions.
-- Drafts / unpublished question sets are strictly exclusive to admins.

drop policy if exists question_sets_select_published on question_sets;
create policy question_sets_select_published on question_sets
  for select using (published or auth_role() = 'admin');

drop policy if exists questions_select_published on questions;
create policy questions_select_published on questions
  for select using (
    auth_role() = 'admin'
    or exists (
      select 1 from question_sets qs
      where qs.id = questions.set_id and qs.published
    )
  );
