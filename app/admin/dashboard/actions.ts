"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { generateSet } from "@/lib/ai";

export type GenerateSetState = { error?: string };

export async function generateQuestionSet(
  _prevState: GenerateSetState,
  formData: FormData,
): Promise<GenerateSetState> {
  const { supabase, user } = await requireRole("admin");

  const title = String(formData.get("title") ?? "").trim();
  const indicator = String(formData.get("indicator") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "sedang");
  const count = Number(formData.get("count") ?? 5);

  if (!title || !indicator) {
    return { error: "Judul dan indikator wajib diisi." };
  }
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    return { error: "Jumlah soal harus antara 1 dan 20." };
  }
  if (!["mudah", "sedang", "sulit"].includes(difficulty)) {
    return { error: "Tingkat kesulitan tidak valid." };
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
    return { error: err instanceof Error ? err.message : "Gagal menghasilkan soal." };
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
    return { error: `Gagal menyimpan set soal: ${setError?.message ?? "unknown error"}` };
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
    return { error: `Gagal menyimpan soal: ${questionsError.message}` };
  }

  redirect(`/admin/sets/${set.id}`);
}

export type GenerateAIResult = {
  isLive: boolean;
  questions?: Array<{
    stem: string;
    options: string[];
    correct_option: number;
    reasons: string[];
    correct_reason: number;
  }>;
  error?: string;
};

export async function generateAIQuestionsAction(params: {
  indicator: string;
  subject?: string;
  grade?: string;
  count: number;
  difficulty: "mudah" | "sedang" | "sulit";
}): Promise<GenerateAIResult> {
  const apiKey = process.env.AI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;

  if (!apiKey || !baseUrl || !model) {
    return { isLive: false };
  }

  try {
    const questions = await generateSet({
      indicator: params.indicator,
      subject: params.subject || undefined,
      grade: params.grade || undefined,
      count: params.count,
      difficulty: params.difficulty,
    });
    return { isLive: true, questions };
  } catch (err) {
    return {
      isLive: false,
      error: err instanceof Error ? err.message : "Gagal memanggil API AI",
    };
  }
}
