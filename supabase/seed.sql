-- Dev-only seed: one admin, one teacher, one student.
--
-- Writes directly into auth.users/auth.identities, which requires running as
-- the `postgres` role — exactly what the Supabase SQL Editor (or `supabase
-- db reset` locally) uses. Passwords are placeholders; sign in once and
-- change them from the profile page, or reset them from the admin screen.

do $$
declare
  admin_id   uuid := gen_random_uuid();
  teacher_id uuid := gen_random_uuid();
  student_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
     'admin@lms.local', crypt('password123', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', '', ''),
    ('00000000-0000-0000-0000-000000000000', teacher_id, 'authenticated', 'authenticated',
     'teacher@lms.local', crypt('password123', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', '', ''),
    ('00000000-0000-0000-0000-000000000000', student_id, 'authenticated', 'authenticated',
     'student@lms.local', crypt('password123', gen_salt('bf')), now(), now(), now(),
     '{"provider":"email","providers":["email"]}', '{}', '', '');

  insert into auth.identities (
    id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values
    (gen_random_uuid(), admin_id::text, admin_id,
     jsonb_build_object('sub', admin_id::text, 'email', 'admin@lms.local'), 'email', now(), now(), now()),
    (gen_random_uuid(), teacher_id::text, teacher_id,
     jsonb_build_object('sub', teacher_id::text, 'email', 'teacher@lms.local'), 'email', now(), now(), now()),
    (gen_random_uuid(), student_id::text, student_id,
     jsonb_build_object('sub', student_id::text, 'email', 'student@lms.local'), 'email', now(), now(), now());

  insert into public.profiles (id, role, full_name) values
    (admin_id, 'admin', 'Admin Utama'),
    (teacher_id, 'teacher', 'Guru Contoh'),
    (student_id, 'student', 'Siswa Contoh');
end $$;
