-- Add explanation column to questions table
-- Stores pedagogical explanation of why the correct option and reason are right,
-- addressing common misconceptions. Revealed to students only after test submission.

alter table questions add column if not exists explanation text;
