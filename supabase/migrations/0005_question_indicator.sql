-- AI Diagnostic LMS — per-question diagnostic blueprint columns (kisi-kisi per nomor soal)
-- Each question carries its own indicator, subtopic (submateri), and cognitive level (e.g. C3, C4, C5).

alter table questions add column if not exists indicator text;
alter table questions add column if not exists subtopic text;
alter table questions add column if not exists cognitive_level text;

notify pgrst, 'reload schema';
