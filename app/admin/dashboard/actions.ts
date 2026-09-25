"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { generateSet } from "@/lib/ai";

export type GenerateSetState = {
  error?: string;
  attempt?: number;
  values?: {
    title: string;
    indicator: string;
    subject: string;
    grade: string;
    difficulty: string;
    count: string;
  };
};

export async function generateQuestionSet(
  prevState: GenerateSetState,
  formData: FormData,
): Promise<GenerateSetState> {
  const { supabase, user } = await requireRole("admin");

  const title = String(formData.get("title") ?? "").trim();
  const indicator = String(formData.get("indicator") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const countRaw = String(formData.get("count") ?? "5");
  const count = Number(countRaw);

  // Echoed back on every failure so the form can re-populate itself — React
  // resets uncontrolled form fields after any action submission, including
  // one that returns an error instead of redirecting.
  const attempt = (prevState.attempt ?? 0) + 1;
  const values = { title, indicator, subject, grade, difficulty, count: countRaw };
  const fail = (error: string): GenerateSetState => ({ error, attempt, values });

  if (!title || !indicator) return fail("Judul dan indikator wajib diisi.");
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    return fail("Jumlah soal harus antara 1 dan 20.");
  }
  if (!["mudah", "sedang", "sulit"].includes(difficulty)) {
    return fail("Tingkat kesulitan tidak valid.");
  }

  let questions;
  try {
    questions = await generateSet({
      indicator,
      subject: subject || undefined,
      grade: grade || undefined,
      count,
      difficulty: difficulty as "mudah" | "sedang" | "sulit",
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Gagal menghasilkan soal.");
  }

  const { data: set, error: setError } = await supabase
    .from("question_sets")
    .insert({
      title,
      indicator,
      subject: subject || null,
      grade: grade || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (setError || !set) {
    return fail(`Gagal menyimpan set soal: ${setError?.message ?? "unknown error"}`);
  }

  const { error: questionsError } = await supabase.from("questions").insert(
    questions.map((q, i) => ({
      set_id: set.id,
      position: i + 1,
      stem: q.stem,
      options: q.options,
      correct_option: q.correct_option,
      reasons: q.reasons,
      correct_reason: q.correct_reason,
    })),
  );

  if (questionsError) {
    return fail(`Gagal menyimpan soal: ${questionsError.message}`);
  }

  redirect(`/admin/sets/${set.id}`);
}
