"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";

export async function submitFullQuiz({
  setId,
  answers,
}: {
  setId: string;
  answers: Record<number | string, { answerKey?: string; reasonKey?: string; confident?: boolean }>;
}) {
  const { supabase, user } = await requireRole("student");

  // 1. Fetch questions for this set
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, position, correct_option, correct_reason")
    .eq("set_id", setId)
    .order("position", { ascending: true });

  if (qError || !questions || questions.length === 0) {
    throw new Error(`Soal tidak ditemukan: ${qError?.message || ""}`);
  }

  // 2. Create attempt with submitted timestamp
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .insert({
      student_id: user.id,
      set_id: setId,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (attemptError || !attempt) {
    throw new Error(`Gagal menyimpan percobaan kuis: ${attemptError?.message}`);
  }

  // 3. Insert responses
  const responsesToInsert = [];
  const keyToIdx: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4 };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    // Check both 1-based position, string position, and 0-based index
    const ans =
      (answers as any)[q.position] ??
      (answers as any)[String(q.position)] ??
      (answers as any)[i + 1] ??
      (answers as any)[String(i + 1)] ??
      (answers as any)[i] ??
      (answers as any)[String(i)];

    if (!ans) continue;

    let answerIdx = 0;
    if (typeof ans.answerKey === "number") {
      answerIdx = ans.answerKey;
    } else if (ans.answerKey) {
      answerIdx = keyToIdx[String(ans.answerKey).toUpperCase()] ?? 0;
    }

    let reasonIdx = 0;
    if (typeof ans.reasonKey === "number") {
      reasonIdx = ans.reasonKey;
    } else if (ans.reasonKey) {
      reasonIdx = keyToIdx[String(ans.reasonKey).toUpperCase()] ?? 0;
    }

    const confident = Boolean(ans.confident);

    responsesToInsert.push({
      attempt_id: attempt.id,
      question_id: q.id,
      answer: answerIdx,
      reason: reasonIdx,
      confident,
    });
  }

  if (responsesToInsert.length > 0) {
    const { error: respError } = await supabase
      .from("responses")
      .insert(responsesToInsert);

    if (respError) {
      console.error("Gagal menyimpan respons jawaban:", respError.message);
      throw new Error(`Gagal menyimpan butir respons: ${respError.message}`);
    }
  }

  // Invalidate Next.js cache so dashboard immediately reflects the real attempt & score
  revalidatePath("/dashboard");
  revalidatePath(`/quiz/${setId}`);
  revalidatePath("/teacher/dashboard");
  revalidatePath(`/teacher/sets/${setId}`);

  return { success: true, attemptId: attempt.id };
}
