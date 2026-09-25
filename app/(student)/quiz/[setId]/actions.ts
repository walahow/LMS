"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export async function submitResponse(formData: FormData) {
  const { supabase } = await requireRole("student");

  const attemptId = String(formData.get("attempt_id") ?? "");
  const questionId = String(formData.get("question_id") ?? "");
  const setId = String(formData.get("set_id") ?? "");
  const answer = Number(formData.get("answer"));
  const reason = Number(formData.get("reason"));
  const confident = formData.get("confident") === "true";

  if (
    !attemptId ||
    !questionId ||
    !setId ||
    !Number.isInteger(answer) ||
    !Number.isInteger(reason) ||
    formData.get("confident") === ""
  ) {
    throw new Error("Jawaban belum lengkap.");
  }

  // RLS scopes responses/attempts to the owning student — this is defense in depth only.
  const { error } = await supabase
    .from("responses")
    .upsert(
      { attempt_id: attemptId, question_id: questionId, answer, reason, confident },
      { onConflict: "attempt_id,question_id" },
    );

  if (error) {
    throw new Error(`Gagal menyimpan jawaban: ${error.message}`);
  }

  redirect(`/quiz/${setId}`);
}
