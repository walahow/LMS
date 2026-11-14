-- AI Diagnostic LMS — add grade and username to profiles table
-- Supports student self-registration with custom grade strings and usernames.

alter table profiles add column if not exists grade text;
alter table profiles add column if not exists username text unique;

create index if not exists profiles_username_idx on profiles(username);
